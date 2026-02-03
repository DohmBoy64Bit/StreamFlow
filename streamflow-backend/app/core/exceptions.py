class StreamFlowException(Exception):
    pass


class AuthenticationError(StreamFlowException):
    pass


class UnauthorizedError(StreamFlowException):
    pass


class NotFoundError(StreamFlowException):
    pass


class ValidationError(StreamFlowException):
    pass


class ExternalAPIError(StreamFlowException):
    pass


class RateLimitExceededError(StreamFlowException):
    pass
