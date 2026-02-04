from pydantic import BaseModel, Field


class CreateListRequest(BaseModel):
    """Request model for creating a new list."""

    name: str = Field(..., min_length=1, max_length=100, description="Name of the list")


class AddItemRequest(BaseModel):
    """Request model for adding an item to a list."""

    tmdb_id: int = Field(..., gt=0, description="TMDB ID of the content")
    media_type: str = Field(..., pattern="^(movie|tv)$", description="Type of media: movie or tv")


class ListItemResponse(BaseModel):
    """Response model for a list item."""

    id: str = Field(..., description="Item ID")
    tmdb_id: int = Field(..., description="TMDB ID of the content")
    media_type: str = Field(..., description="Type of media: movie or tv")
    added_at: str = Field(..., description="Timestamp when item was added")


class ListResponse(BaseModel):
    """Response model for a list."""

    id: str = Field(..., description="List ID")
    name: str = Field(..., description="List name")
    created_at: str = Field(..., description="List creation timestamp")
    updated_at: str = Field(..., description="List last update timestamp")
    icon_url: str | None = Field(default=None, description="URL to the custom list icon")
    item_count: int = Field(default=0, description="Number of items in the list")


class ListWithItemsResponse(BaseModel):
    """Response model for a list with its items."""

    id: str = Field(..., description="List ID")
    name: str = Field(..., description="List name")
    created_at: str = Field(..., description="List creation timestamp")
    updated_at: str = Field(..., description="List last update timestamp")
    icon_url: str | None = Field(default=None, description="URL to the custom list icon")
    items: list[ListItemResponse] = Field(default=[], description="Items in the list")
