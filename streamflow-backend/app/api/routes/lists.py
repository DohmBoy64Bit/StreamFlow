from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.db_models import User
from app.schemas.list import (
    AddItemRequest,
    CreateListRequest,
    ListItemResponse,
    ListResponse,
    ListWithItemsResponse,
)
from app.services.list_service import (
    ItemAlreadyInListError,
    ItemNotFoundError,
    ListNotFoundError,
    add_item_to_list,
    create_list,
    delete_list,
    get_list_by_id,
    get_list_items,
    get_user_lists,
    remove_item_from_list,
    update_list_icon,
)

router = APIRouter()


@router.post("", response_model=ListResponse, status_code=201)
async def create_new_list(
    list_request: CreateListRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ListResponse:
    """Create a new list for the authenticated user."""
    list_obj = create_list(db, current_user.id, list_request.name)

    return ListResponse(
        id=str(list_obj.id),
        name=list_obj.name,
        created_at=list_obj.created_at.isoformat(),
        updated_at=list_obj.updated_at.isoformat(),
        item_count=0,
    )


@router.get("", response_model=list[ListResponse])
async def get_lists(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ListResponse]:
    """Get all lists for the authenticated user."""
    from app.models.db_models import ListItem
    
    lists = get_user_lists(db, current_user.id)

    return [
        ListResponse(
            id=str(list_obj.id),
            name=list_obj.name,
            created_at=list_obj.created_at.isoformat(),
            updated_at=list_obj.updated_at.isoformat(),
            icon_url=list_obj.icon_url,
            item_count=db.query(ListItem).filter(ListItem.list_id == list_obj.id).count(),
        )
        for list_obj in lists
    ]


@router.get("/{list_id}", response_model=ListWithItemsResponse)
async def get_list(
    list_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ListWithItemsResponse:
    """Get a specific list with its items."""
    try:
        from uuid import UUID

        list_uuid = UUID(list_id)

        list_obj = get_list_by_id(db, list_uuid, current_user.id)
        items = get_list_items(db, list_uuid, current_user.id)

        return ListWithItemsResponse(
            id=str(list_obj.id),
            name=list_obj.name,
            created_at=list_obj.created_at.isoformat(),
            updated_at=list_obj.updated_at.isoformat(),
            icon_url=list_obj.icon_url,
            items=[
                ListItemResponse(
                    id=str(item.id),
                    tmdb_id=item.tmdb_id,
                    media_type=item.media_type,
                    added_at=item.added_at.isoformat(),
                )
                for item in items
            ],
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid list ID format")
    except ListNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{list_id}", status_code=204)
async def delete_list_endpoint(
    list_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a list."""
    try:
        from uuid import UUID

        list_uuid = UUID(list_id)

        delete_list(db, list_uuid, current_user.id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid list ID format")
    except ListNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{list_id}/items", response_model=ListItemResponse, status_code=201)
async def add_item(
    list_id: str,
    item_request: AddItemRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ListItemResponse:
    """Add an item to a list."""
    try:
        from uuid import UUID

        list_uuid = UUID(list_id)

        item = add_item_to_list(
            db, list_uuid, current_user.id, item_request.tmdb_id, item_request.media_type
        )

        return ListItemResponse(
            id=str(item.id),
            tmdb_id=item.tmdb_id,
            media_type=item.media_type,
            added_at=item.added_at.isoformat(),
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid list ID format")
    except ListNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ItemAlreadyInListError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{list_id}/items/{item_id}", status_code=204)
async def remove_item(
    list_id: str,
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Remove an item from a list."""
    try:
        from uuid import UUID

        list_uuid = UUID(list_id)
        item_uuid = UUID(item_id)

        remove_item_from_list(db, list_uuid, item_uuid, current_user.id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except ListNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ItemNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{list_id}/icon", response_model=ListResponse)
async def upload_list_icon(
    list_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
) -> ListResponse:
    """Upload a custom icon for a list."""
    try:
        import os
        import uuid
        from uuid import UUID

        list_uuid = UUID(list_id)

        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Create unique filename
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join("uploads", filename)

        # Save file
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Update list in database
        icon_url = f"/api/v1/uploads/{filename}"
        list_obj = update_list_icon(db, list_uuid, current_user.id, icon_url)

        from app.models.db_models import ListItem

        return ListResponse(
            id=str(list_obj.id),
            name=list_obj.name,
            created_at=list_obj.created_at.isoformat(),
            updated_at=list_obj.updated_at.isoformat(),
            icon_url=list_obj.icon_url,
            item_count=db.query(ListItem).filter(ListItem.list_id == list_obj.id).count(),
        )

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid list ID format")
    except ListNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Icon upload error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during upload")
