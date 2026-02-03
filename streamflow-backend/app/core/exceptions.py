class StreamFlowError(Exception):
    pass


class AuthenticationError(StreamFlowError):
    pass


class UnauthorizedError(StreamFlowError):
    pass


class NotFoundError(StreamFlowError):
    pass


class ValidationError(StreamFlowError):
    pass


class ExternalAPIError(StreamFlowError):
    pass


class RateLimitExceededError(StreamFlowError):
    pass
