export const NOTIFICATION_DISPATCHER = Symbol('NOTIFICATION_DISPATCHER');

export type NotificationDispatchRequest = {
    eventName: string;
    aggregateId: string;
    payload: Record<string, unknown>;
};

export interface INotificationDispatcher {
    dispatch(request: NotificationDispatchRequest): Promise<void>;
}
