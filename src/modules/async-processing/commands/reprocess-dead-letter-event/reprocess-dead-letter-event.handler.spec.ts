import { ReprocessDeadLetterEventHandler } from './reprocess-dead-letter-event.handler';
import { ReprocessDeadLetterEventCommand } from './reprocess-dead-letter-event.command';

describe('ReprocessDeadLetterEventHandler', () => {
    it('deve delegar reprocessamento para o serviço', async () => {
        const reprocessDeadLetterEventService = {
            execute: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    outboxEventId: 'evt-1',
                    status: 'queued',
                    reprocessedBy: 1,
                },
            }),
        };
        const handler = new ReprocessDeadLetterEventHandler(
            reprocessDeadLetterEventService as never,
        );
        const command = new ReprocessDeadLetterEventCommand('evt-1', 1, 'admin');

        const result = await handler.execute(command);

        expect(result).toEqual({
            success: true,
            data: {
                outboxEventId: 'evt-1',
                status: 'queued',
                reprocessedBy: 1,
            },
        });
        expect(reprocessDeadLetterEventService.execute).toHaveBeenCalledWith({
            outboxEventId: 'evt-1',
            actorId: 1,
            actorRole: 'admin',
        });
    });
});

