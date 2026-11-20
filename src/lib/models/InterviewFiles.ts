import { connection } from "@/lib/db";

import { DbFile } from "@/lib/types/file";
import { DbInterviewFile, InterviewFile } from "@/lib/types/interview";
import sql from "sql-template-tag";

type InterviewFileJoinFile = DbInterviewFile & DbFile;

const availableRoles = ['interviewer', 'participant', 'combined', 'uncategorized'];

export class InterviewFiles {
    static async get(interview_path: string): Promise<InterviewFile[]> {

        const results = await connection.query<InterviewFileJoinFile>(
            sql`
            SELECT *
            FROM interview_files
            LEFT JOIN files ON interview_file = file_path
            WHERE interview_path = ${interview_path}
            `);
        return results.rows.map((row: InterviewFileJoinFile) => {
            const interview_file_tags = row.interview_file_tags.split(',').map((tag: string) => tag.trim());
            return {
                interview_file: {
                    file_path: row.file_path,
                    file_name: row.file_name,
                    file_type: row.file_type,
                    file_size_mb: row.file_size_mb,
                    m_time: row.m_time,
                    md5: row.md5,
                },
                interview_file_tags: interview_file_tags,
                ignored: row.ignored,
            };
        });
    }

    static async getInterviewName(file_path: string): Promise<string | null> {
        const result = await connection.query(
            sql`
            SELECT interview_name
            FROM interview_files
            LEFT JOIN interview_parts USING (interview_path)
            WHERE interview_file = ${file_path}
            `);
        if (result.rows.length > 0) {
            return result.rows[0].interview_name;
        }
        return null;
    }

    static async addRoleTag(file_path: string, role: string): Promise<string> {

        const currentRoleQuery = sql`
            SELECT string_to_array(interview_file_tags,',') as interview_file_tags
            FROM interview_files
            WHERE interview_file = ${file_path}`;
        const currentRoleResult = await connection.query<{interview_file_tags:string[]}>(currentRoleQuery);
        const currentTags = currentRoleResult.rows[0].interview_file_tags;

        // Remove existing role tag if it exists
        let updatedTags = currentTags.filter((tag: string) => !availableRoles.some((role: string) => tag.toLowerCase().includes(role)));

        // if new role is 'combined', also remove 'diarized'
        if (role.toLowerCase().includes('combined')) {
            updatedTags = updatedTags.filter((tag: string) => !tag.toLowerCase().includes('diarized'));
        } else {
            // if new role is 'interviewer' or 'participant', also remove 'combined'
            if (role.toLowerCase().includes('interviewer') || role.toLowerCase().includes('participant')) {
                updatedTags = updatedTags.filter((tag: string) => !tag.toLowerCase().includes('combined'));
                // Add 'diarized' tag
                updatedTags.push('diarized');
            }
        }

        // Add the new role tag
        updatedTags.push(role);

        // ensure set (no duplicates)
        const uniqueTags = new Set(updatedTags);
        const updatedTagsArray = Array.from(uniqueTags);

        const updatedTagsString: string = updatedTagsArray.join(',');

        const updateQuery = `
            UPDATE interview_files
            SET interview_file_tags = $1
            WHERE interview_file = $2
        `;
        await connection.query(updateQuery, [updatedTagsString, file_path]);

        return updatedTagsString;
    }

    static async removeRoleTag(file_path: string): Promise<string> {

        // Perform tag split inside PostgreSQL
        const currentRoleQuery = sql`
            SELECT string_to_array(interview_file_tags,',')
            FROM interview_files
            WHERE interview_file = ${file_path}
        `;
        const currentRoleResult = await connection.query<string[]>(currentRoleQuery);
        const currentTags = currentRoleResult.rows[0];

        // Remove existing role tag if it exists
        const updatedTags = currentTags.filter((tag: string) => !availableRoles.some((role: string) => tag.toLowerCase().includes(role)));
        // Mark as uncategorized
        updatedTags.push('uncategorized');

        // Perform tag merge inside PostgreSQL
        const updateQuery = sql`
            UPDATE interview_files
            SET interview_file_tags = array_to_string(${updatedTags},',')
            WHERE interview_file = ${file_path}
        `;
        await connection.query(updateQuery);
        return updatedTags.join(",");
    }

    static async setIgnoreFile(file_path: string, ignored: boolean): Promise<void> {

        const updateQuery = `
            UPDATE interview_files
            SET ignored = $1
            WHERE interview_file = $2
        `;
        await connection.query(updateQuery, [ignored, file_path]);
    }

}
