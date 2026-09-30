import { getConnection } from "@/lib/db";

// pipeline_ledger.datetime_overrides
// Mirrors pipeline/models/datetime_overrides.py on the dpinterview side.
// Staff-confirmed event datetime for a raw file/directory that failed to
// date-parse - consumed by the Python crawler on its next pass, which then
// resolves the corresponding pipeline_failures row itself. Written here, not
// resolved here: this table only records intent.

export class DatetimeOverrides {
    static async create(
        identifier: string,
        study_id: string | null,
        subject_id: string | null,
        override_datetime: string
    ): Promise<void> {
        const connection = getConnection();
        await connection.query(
            `
            INSERT INTO pipeline_ledger.datetime_overrides (
                do_identifier, do_study_id, do_subject_id, do_override_datetime
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (do_identifier) DO UPDATE SET
                do_study_id = EXCLUDED.do_study_id,
                do_subject_id = EXCLUDED.do_subject_id,
                do_override_datetime = EXCLUDED.do_override_datetime,
                do_consumed_at = NULL
            `,
            [identifier, study_id, subject_id, override_datetime]
        );
    }

    static async getByIdentifiers(identifiers: string[]): Promise<{ do_identifier: string; do_consumed_at: Date | null }[]> {
        if (identifiers.length === 0) {
            return [];
        }
        const connection = getConnection();
        const { rows } = await connection.query(
            `
            SELECT do_identifier, do_consumed_at
            FROM pipeline_ledger.datetime_overrides
            WHERE do_identifier = ANY($1)
            `,
            [identifiers]
        );
        return rows;
    }
}
