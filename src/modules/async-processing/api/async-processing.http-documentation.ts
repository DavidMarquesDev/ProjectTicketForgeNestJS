export const reprocessDeadLetterApiOperation = {
    summary: 'Reprocessa evento da dead letter queue',
    description: 'Permite que um administrador reenfileire um evento dead-lettered para novo processamento.',
};

export const reprocessDeadLetterApiParam = {
    name: 'outboxEventId',
    description: 'Identificador UUID do evento de outbox',
    example: 'c2b008f9-d95f-48b9-b337-378f1bfa8921',
};

export const reprocessDeadLetterApiOkResponse = {
    description: 'Evento reenfileirado com sucesso',
    schema: {
        example: {
            success: true,
            data: {
                outboxEventId: 'c2b008f9-d95f-48b9-b337-378f1bfa8921',
                status: 'queued',
                reprocessedBy: 1,
            },
        },
    },
};

export const reprocessDeadLetterApiForbiddenResponse = {
    description: 'Usuário sem permissão para reprocessar DLQ',
    schema: {
        example: {
            success: false,
            message: 'Apenas admin pode reprocessar eventos da dead letter queue',
            code: 'FORBIDDEN',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const reprocessDeadLetterApiNotFoundResponse = {
    description: 'Evento de outbox inexistente',
    schema: {
        example: {
            success: false,
            message: 'Evento de outbox não encontrado',
            code: 'NOT_FOUND',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const reprocessDeadLetterApiConflictResponse = {
    description: 'Evento não está em dead letter',
    schema: {
        example: {
            success: false,
            message: 'Apenas eventos em dead letter podem ser reprocessados',
            code: 'CONFLICT',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const listDeadLettersApiOperation = {
    summary: 'Lista eventos da dead letter queue',
    description:
        'Retorna eventos dead-lettered com paginação e filtros operacionais. O payload mascarado pode ser truncado quando exceder o limite configurado.',
};

export const listDeadLettersApiMaskModeQuery = {
    name: 'maskMode',
    required: false,
    enum: ['total', 'partial'],
    description: 'Define o modo de mascaramento do payload sensível na listagem',
    example: 'total',
};

export const listDeadLettersApiOkResponse = {
    description: 'Eventos dead-lettered retornados com sucesso',
    schema: {
        example: {
            success: true,
            data: [
                {
                    id: 'c2b008f9-d95f-48b9-b337-378f1bfa8921',
                    eventId: 'domain-event-123',
                    eventName: 'TicketNotificationRequestedEvent',
                    schemaVersion: 1,
                    aggregateType: 'ticket',
                    aggregateId: '101',
                    status: 'dead_lettered',
                    attempts: 5,
                    deadLetteredAt: '2026-03-28T12:30:00.000Z',
                    lastError: 'Falha final de integração',
                    payloadMasked: {
                        cpf: '***',
                        email: '***',
                        token: '***',
                        ticketId: 101,
                    },
                    createdAt: '2026-03-28T12:00:00.000Z',
                    updatedAt: '2026-03-28T12:30:00.000Z',
                },
            ],
            meta: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
            },
        },
    },
};

export const listDeadLettersApiBadRequestResponse = {
    description: 'Parâmetros inválidos para filtros/paginação',
    schema: {
        example: {
            success: false,
            message: 'attemptsMin não pode ser maior que attemptsMax',
            code: 'BAD_REQUEST',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};

export const getDeadLetterByIdApiOperation = {
    summary: 'Detalha evento da dead letter queue',
    description:
        'Retorna o evento dead-lettered por id com payload mascarado. O payload mascarado pode ser truncado quando exceder o limite configurado.',
};

export const getDeadLetterByIdApiParam = {
    name: 'outboxEventId',
    description: 'Identificador UUID do evento de outbox em dead letter',
    example: 'c2b008f9-d95f-48b9-b337-378f1bfa8921',
};

export const getDeadLetterByIdApiMaskModeQuery = {
    name: 'maskMode',
    required: false,
    enum: ['total', 'partial'],
    description: 'Define o modo de mascaramento do payload sensível',
    example: 'partial',
};

export const getDeadLetterByIdApiOkResponse = {
    description: 'Evento dead-lettered retornado com sucesso',
    schema: {
        example: {
            success: true,
            data: {
                id: 'c2b008f9-d95f-48b9-b337-378f1bfa8921',
                eventId: 'domain-event-123',
                eventName: 'TicketNotificationRequestedEvent',
                schemaVersion: 1,
                aggregateType: 'ticket',
                aggregateId: '101',
                status: 'dead_lettered',
                attempts: 5,
                deadLetteredAt: '2026-03-28T12:30:00.000Z',
                lastError: 'Falha final de integração',
                payloadMasked: {
                    cpf: '***8901',
                    email: 'u***@ticketforge.dev',
                    token: '***',
                    ticketId: 101,
                },
                createdAt: '2026-03-28T12:00:00.000Z',
                updatedAt: '2026-03-28T12:30:00.000Z',
            },
        },
    },
};

export const getDeadLetterByIdApiConflictResponse = {
    description: 'Evento informado não está em dead letter',
    schema: {
        example: {
            success: false,
            message: 'O evento informado não está em dead letter',
            code: 'CONFLICT',
            trace_id: '64a9b8e4-71f2-49b6-8c27-aed216c3ad7a',
        },
    },
};
