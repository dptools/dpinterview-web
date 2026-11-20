--
-- PostgreSQL database dump
--

\restrict Jh0H05jnjV8RFDaddph7VNfgEhxEVTv6KHFCKb6pItImKYEKuU3tLt4lJtPEqPi

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-1.pgdg22.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: acoustics; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS acoustics;


--
-- Name: facepipe; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS facepipe;


--
-- Name: pipeline_ledger; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS pipeline_ledger;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: transcribeme; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS transcribeme;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audio_qc; Type: TABLE; Schema: acoustics; Owner: -
--

CREATE TABLE IF NOT EXISTS acoustics.audio_qc (
    qc_source_path text NOT NULL,
    qc_passed boolean NOT NULL,
    qc_fail_reasons text[] DEFAULT '{}'::text[] NOT NULL,
    qc_audio_duration_s double precision,
    qc_peak_amplitude double precision,
    qc_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lld_extraction; Type: TABLE; Schema: acoustics; Owner: -
--

CREATE TABLE IF NOT EXISTS acoustics.lld_extraction (
    lld_source_path text NOT NULL,
    lld_source_kind text NOT NULL,
    lld_output_path text NOT NULL,
    lld_summary_path text NOT NULL,
    lld_num_frames integer NOT NULL,
    lld_duration_s double precision NOT NULL,
    lld_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT lld_extraction_lld_source_kind_check CHECK ((lld_source_kind = ANY (ARRAY['interview'::text, 'journal'::text])))
);


--
-- Name: facepipe_qc; Type: TABLE; Schema: facepipe; Owner: -
--

CREATE TABLE IF NOT EXISTS facepipe.facepipe_qc (
    fp_source_video_path text NOT NULL,
    interview_name text NOT NULL,
    rate_miss_faces double precision NOT NULL,
    rate_miss_landm double precision NOT NULL,
    avg_face_confid double precision NOT NULL,
    avg_nfaces double precision NOT NULL,
    rate_face_low_cnr double precision NOT NULL,
    rate_img_overexp double precision NOT NULL,
    avg_facebox_width double precision NOT NULL,
    avg_facebox_height double precision NOT NULL,
    median_pitch double precision NOT NULL,
    median_yaw double precision NOT NULL,
    median_roll double precision NOT NULL,
    other_fields jsonb,
    fpqc_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: facepipe_runs; Type: TABLE; Schema: facepipe; Owner: -
--

CREATE TABLE IF NOT EXISTS facepipe.facepipe_runs (
    fp_source_video_path text NOT NULL,
    fp_features_csv_path text NOT NULL,
    fp_run_metadata jsonb NOT NULL,
    fp_duration_s integer NOT NULL,
    fp_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: datetime_overrides; Type: TABLE; Schema: pipeline_ledger; Owner: -
--

CREATE TABLE IF NOT EXISTS pipeline_ledger.datetime_overrides (
    do_id integer NOT NULL,
    do_identifier text NOT NULL,
    do_study_id text,
    do_subject_id text,
    do_override_datetime timestamp without time zone NOT NULL,
    do_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    do_consumed_at timestamp without time zone
);


--
-- Name: datetime_overrides_do_id_seq; Type: SEQUENCE; Schema: pipeline_ledger; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS pipeline_ledger.datetime_overrides_do_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: datetime_overrides_do_id_seq; Type: SEQUENCE OWNED BY; Schema: pipeline_ledger; Owner: -
--

ALTER SEQUENCE pipeline_ledger.datetime_overrides_do_id_seq OWNED BY pipeline_ledger.datetime_overrides.do_id;


--
-- Name: pipeline_failures; Type: TABLE; Schema: pipeline_ledger; Owner: -
--

CREATE TABLE IF NOT EXISTS pipeline_ledger.pipeline_failures (
    pf_id integer NOT NULL,
    pf_stage text NOT NULL,
    pf_error_code text DEFAULT 'unknown'::text NOT NULL,
    pf_identifier_type text NOT NULL,
    pf_identifier text NOT NULL,
    pf_study_id text,
    pf_subject_id text,
    pf_error text NOT NULL,
    pf_error_type text,
    pf_occurrence_count integer DEFAULT 1 NOT NULL,
    pf_first_seen_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pf_last_seen_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pf_resolved boolean DEFAULT false NOT NULL,
    pf_resolved_at timestamp without time zone,
    pf_resolved_note text
);


--
-- Name: pipeline_failures_pf_id_seq; Type: SEQUENCE; Schema: pipeline_ledger; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS pipeline_ledger.pipeline_failures_pf_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pipeline_failures_pf_id_seq; Type: SEQUENCE OWNED BY; Schema: pipeline_ledger; Owner: -
--

ALTER SEQUENCE pipeline_ledger.pipeline_failures_pf_id_seq OWNED BY pipeline_ledger.pipeline_failures.pf_id;


--
-- Name: audio_journals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.audio_journals (
    aj_path text NOT NULL,
    aj_name text NOT NULL,
    aj_datetime timestamp without time zone NOT NULL,
    aj_day integer NOT NULL,
    aj_session integer NOT NULL,
    subject_id text NOT NULL,
    study_id text NOT NULL
);


--
-- Name: dashboard_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.dashboard_actions (
    da_id integer NOT NULL,
    interview_name character varying(255) NOT NULL,
    da_action character varying(255) NOT NULL,
    da_user_id character varying(255) NOT NULL,
    da_target_id character varying(255),
    da_target_type character varying(255),
    da_metadata jsonb,
    da_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: dashboard_actions_da_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.dashboard_actions_da_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dashboard_actions_da_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dashboard_actions_da_id_seq OWNED BY public.dashboard_actions.da_id;


--
-- Name: data_dictionary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.data_dictionary (
    field_name text,
    form_name text,
    section_header text,
    field_type text,
    field_label text,
    select_choices_or_calculations text,
    field_note text,
    text_validation_type_or_show_slider_number text,
    text_validation_min text,
    text_validation_max text,
    identifier text,
    branching_logic text,
    required_field text,
    custom_alignment text,
    question_number double precision,
    matrix_group_name text,
    matrix_ranking double precision,
    field_annotation text
);


--
-- Name: decrypted_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.decrypted_files (
    source_path text NOT NULL,
    destination_path text NOT NULL,
    requested_by text NOT NULL,
    decrypted boolean DEFAULT false NOT NULL,
    process_time real,
    requested_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    decrypted_at timestamp without time zone
);


--
-- Name: expected_interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.expected_interviews (
    interview_name text NOT NULL,
    subject_id text NOT NULL,
    study_id text NOT NULL,
    form_name text NOT NULL,
    event_name text NOT NULL,
    expected_interview_date timestamp without time zone NOT NULL,
    expected_interview_day integer NOT NULL,
    expected_interview_type text NOT NULL
);


--
-- Name: exported_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.exported_assets (
    interview_name text NOT NULL,
    asset_path text NOT NULL,
    asset_type text NOT NULL,
    asset_export_type text NOT NULL,
    asset_tag text NOT NULL,
    asset_destination text NOT NULL,
    aset_exported_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fau_role_validation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.fau_role_validation (
    interview_name text NOT NULL,
    frv_fau_metrics jsonb,
    frv_matches_with_transcript boolean,
    frv_timestamp timestamp without time zone
);


--
-- Name: ffprobe_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.ffprobe_metadata (
    fm_source_path text NOT NULL,
    fm_requested_by text NOT NULL,
    fm_format_name text,
    fm_format_long_name text,
    fm_duration text,
    fm_size text,
    fm_bit_rate text,
    fm_probe_score text,
    fm_tags text,
    fm_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ffprobe_metadata_audio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.ffprobe_metadata_audio (
    fma_source_path text NOT NULL,
    fma_requested_by text NOT NULL,
    fma_index integer NOT NULL,
    fma_codec_name character varying(255) NOT NULL,
    fma_codec_long_name character varying(255) NOT NULL,
    fma_profile character varying(255) NOT NULL,
    fma_codec_type character varying(255) NOT NULL,
    fma_codec_tag_string character varying(255) NOT NULL,
    fma_codec_tag character varying(255) NOT NULL,
    fma_sample_fmt character varying(255) NOT NULL,
    fma_sample_rate integer NOT NULL,
    fma_channels integer NOT NULL,
    fma_channel_layout character varying(255) NOT NULL,
    fma_bits_per_sample integer NOT NULL,
    fma_r_frame_rate character varying(255) NOT NULL,
    fma_avg_frame_rate character varying(255) NOT NULL,
    fma_time_base character varying(255) NOT NULL,
    fma_start_pts integer NOT NULL,
    fma_start_time character varying(255) NOT NULL,
    fma_duration character varying(255) NOT NULL,
    fma_extradata_size integer NOT NULL
);


--
-- Name: ffprobe_metadata_video; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.ffprobe_metadata_video (
    fmv_source_path text NOT NULL,
    fmv_requested_by text NOT NULL,
    ir_role character varying(255),
    fmv_index integer NOT NULL,
    fmv_codec_name character varying(255) NOT NULL,
    fmv_codec_long_name character varying(255) NOT NULL,
    fmv_profile character varying(255) NOT NULL,
    fmv_codec_type character varying(255) NOT NULL,
    fmv_codec_tag_string character varying(255) NOT NULL,
    fmv_codec_tag character varying(255) NOT NULL,
    fmv_width integer NOT NULL,
    fmv_height integer NOT NULL,
    fmv_coded_width integer NOT NULL,
    fmv_coded_height integer NOT NULL,
    fmv_closed_captions integer,
    fmv_film_grain integer,
    fmv_has_b_frames integer NOT NULL,
    fmv_sample_aspect_ratio character varying(255),
    fmv_display_aspect_ratio character varying(255),
    fmv_pix_fmt character varying(255) NOT NULL,
    fmv_level integer NOT NULL,
    fmv_color_range character varying(255),
    fmv_chrorma_location character varying(255),
    fmv_field_order character varying(255) NOT NULL,
    fmv_refs integer NOT NULL,
    fmv_r_frame_rate character varying(255) NOT NULL,
    fmv_avg_frame_rate character varying(255) NOT NULL,
    fmv_time_base character varying(255) NOT NULL,
    fmv_start_pts integer NOT NULL,
    fmv_start_time character varying(255) NOT NULL,
    fmv_duration character varying(255) NOT NULL,
    fmv_extradata_size integer NOT NULL
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.files (
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size_mb double precision NOT NULL,
    file_path text NOT NULL,
    m_time timestamp without time zone NOT NULL,
    md5 text
);


--
-- Name: form_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.form_data (
    subject_id text NOT NULL,
    study_id text NOT NULL,
    form_name text NOT NULL,
    event_name text NOT NULL,
    form_data jsonb NOT NULL,
    source_mdata timestamp without time zone NOT NULL,
    imported_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: interview_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.interview_files (
    interview_path text NOT NULL,
    interview_file text NOT NULL,
    interview_file_tags text,
    ignored boolean DEFAULT false
);


--
-- Name: interview_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.interview_parts (
    interview_path text NOT NULL,
    interview_name text,
    interview_day integer NOT NULL,
    interview_part integer NOT NULL,
    interview_datetime timestamp without time zone NOT NULL,
    is_primary boolean DEFAULT false,
    is_duplicate boolean DEFAULT false
);


--
-- Name: interview_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.interview_roles (
    ir_role text NOT NULL
);


--
-- Name: interview_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.interview_types (
    interview_type text NOT NULL
);


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.interviews (
    interview_name text NOT NULL,
    interview_type text NOT NULL,
    subject_id text NOT NULL,
    study_id text NOT NULL
);


--
-- Name: key_store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.key_store (
    name text NOT NULL,
    value text NOT NULL
);


--
-- Name: llm_language_identification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.llm_language_identification (
    llm_source_transcript text NOT NULL,
    ollama_model_identifier text NOT NULL,
    llm_identified_language_code text,
    llm_confidence double precision,
    llm_metrics jsonb NOT NULL,
    llm_timestamp timestamp without time zone NOT NULL,
    llm_task_duration_s double precision NOT NULL
);


--
-- Name: llm_speaker_identification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.llm_speaker_identification (
    llm_source_transcript text NOT NULL,
    ollama_model_identifier text NOT NULL,
    llm_role text NOT NULL,
    llm_identified_speaker_label text NOT NULL,
    llm_confidence double precision,
    llm_metrics jsonb NOT NULL,
    llm_timestamp timestamp without time zone NOT NULL,
    llm_task_duration_s double precision NOT NULL
);


--
-- Name: load_openface; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.load_openface (
    interview_name text NOT NULL,
    subject_id text NOT NULL,
    study_id text NOT NULL,
    subject_of_processed_path text,
    interviewer_of_processed_path text,
    lof_notes text,
    lof_process_time real,
    lof_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lof_report_generation_possible boolean DEFAULT false NOT NULL
);


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.logs (
    log_id integer NOT NULL,
    log_module text NOT NULL,
    log_message text NOT NULL,
    log_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS public.logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logs_log_id_seq OWNED BY public.logs.log_id;


--
-- Name: manual_qc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.manual_qc (
    qc_target_id text NOT NULL,
    qc_target_type text NOT NULL,
    qc_data jsonb NOT NULL,
    qc_user_id text NOT NULL,
    qc_timestamp timestamp without time zone NOT NULL
);


--
-- Name: openface; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.openface (
    vs_path text NOT NULL,
    ir_role text NOT NULL,
    video_path text NOT NULL,
    of_processed_path text NOT NULL,
    of_process_time real,
    of_overlay_provess_time real,
    of_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: openface_qc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.openface_qc (
    of_processed_path text NOT NULL,
    faces_count integer NOT NULL,
    frames_count integer NOT NULL,
    sucessful_frames_count integer NOT NULL,
    sucessful_frames_percentage real NOT NULL,
    successful_frames_confidence_mean real,
    successful_frames_confidence_std real,
    successful_frames_confidence_median real,
    passed boolean NOT NULL,
    ofqc_process_time real,
    ofqc_timestamp timestamp without time zone NOT NULL
);


--
-- Name: pdf_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.pdf_reports (
    interview_name text NOT NULL,
    pr_version text NOT NULL,
    pr_path text NOT NULL,
    pr_generation_time real NOT NULL,
    pr_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: study; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.study (
    study_id text NOT NULL
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.subjects (
    study_id text NOT NULL,
    subject_id text NOT NULL,
    is_active boolean NOT NULL,
    consent_date date NOT NULL,
    optional_notes json
);


--
-- Name: transcript_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.transcript_files (
    transcript_file text NOT NULL,
    identifier_name text NOT NULL,
    identifier_type text NOT NULL,
    transcript_file_tags text
);


--
-- Name: video_quick_qc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.video_quick_qc (
    video_path text NOT NULL,
    has_black_bars boolean NOT NULL,
    black_bar_height integer,
    vqqc_process_time real NOT NULL,
    vqqc_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: video_streams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.video_streams (
    vs_path text NOT NULL,
    video_path text NOT NULL,
    ir_role text NOT NULL,
    vs_process_time real,
    vs_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audio_qc; Type: TABLE; Schema: transcribeme; Owner: -
--

CREATE TABLE IF NOT EXISTS transcribeme.audio_qc (
    aqc_source_path text NOT NULL,
    aqc_passed boolean NOT NULL,
    aqc_metrics jsonb NOT NULL,
    aqc_fail_reasons jsonb,
    aqc_duration_s double precision NOT NULL,
    aqc_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aqc_override boolean DEFAULT false
);


--
-- Name: redacted_transcripts; Type: TABLE; Schema: transcribeme; Owner: -
--

CREATE TABLE IF NOT EXISTS transcribeme.redacted_transcripts (
    unredacted_transcript_path text NOT NULL,
    redacted_transcript_path text NOT NULL,
    redaction_timestamp timestamp without time zone NOT NULL
);


--
-- Name: transcribeme_pull; Type: TABLE; Schema: transcribeme; Owner: -
--

CREATE TABLE IF NOT EXISTS transcribeme.transcribeme_pull (
    transcription_destination_path text NOT NULL,
    sftp_download_path text NOT NULL,
    sftp_archive_path text NOT NULL,
    sftp_download_duration_s integer NOT NULL,
    sftp_download_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_audio_file_path text NOT NULL
);


--
-- Name: transcribeme_push; Type: TABLE; Schema: transcribeme; Owner: -
--

CREATE TABLE IF NOT EXISTS transcribeme.transcribeme_push (
    transcription_source_path text NOT NULL,
    source_language text NOT NULL,
    sftp_upload_path text NOT NULL,
    transcription_destination_path text NOT NULL,
    sftp_upload_duration_s integer NOT NULL,
    sftp_upload_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wav_conversion; Type: TABLE; Schema: transcribeme; Owner: -
--

CREATE TABLE IF NOT EXISTS transcribeme.wav_conversion (
    wc_source_path text NOT NULL,
    wc_destination_path text NOT NULL,
    wc_duration_s integer NOT NULL,
    wc_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: datetime_overrides do_id; Type: DEFAULT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.datetime_overrides ALTER COLUMN do_id SET DEFAULT nextval('pipeline_ledger.datetime_overrides_do_id_seq'::regclass);


--
-- Name: pipeline_failures pf_id; Type: DEFAULT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.pipeline_failures ALTER COLUMN pf_id SET DEFAULT nextval('pipeline_ledger.pipeline_failures_pf_id_seq'::regclass);


--
-- Name: dashboard_actions da_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_actions ALTER COLUMN da_id SET DEFAULT nextval('public.dashboard_actions_da_id_seq'::regclass);


--
-- Name: logs log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs ALTER COLUMN log_id SET DEFAULT nextval('public.logs_log_id_seq'::regclass);


--
-- Name: audio_qc audio_qc_pkey; Type: CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.audio_qc
    ADD CONSTRAINT audio_qc_pkey PRIMARY KEY (qc_source_path);


--
-- Name: lld_extraction lld_extraction_lld_output_path_key; Type: CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.lld_extraction
    ADD CONSTRAINT lld_extraction_lld_output_path_key UNIQUE (lld_output_path);


--
-- Name: lld_extraction lld_extraction_lld_summary_path_key; Type: CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.lld_extraction
    ADD CONSTRAINT lld_extraction_lld_summary_path_key UNIQUE (lld_summary_path);


--
-- Name: lld_extraction lld_extraction_pkey; Type: CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.lld_extraction
    ADD CONSTRAINT lld_extraction_pkey PRIMARY KEY (lld_source_path);


--
-- Name: facepipe_qc facepipe_qc_pkey; Type: CONSTRAINT; Schema: facepipe; Owner: -
--

ALTER TABLE ONLY facepipe.facepipe_qc
    ADD CONSTRAINT facepipe_qc_pkey PRIMARY KEY (fp_source_video_path);


--
-- Name: facepipe_runs facepipe_runs_pkey; Type: CONSTRAINT; Schema: facepipe; Owner: -
--

ALTER TABLE ONLY facepipe.facepipe_runs
    ADD CONSTRAINT facepipe_runs_pkey PRIMARY KEY (fp_source_video_path);


--
-- Name: datetime_overrides datetime_overrides_do_identifier_key; Type: CONSTRAINT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.datetime_overrides
    ADD CONSTRAINT datetime_overrides_do_identifier_key UNIQUE (do_identifier);


--
-- Name: datetime_overrides datetime_overrides_pkey; Type: CONSTRAINT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.datetime_overrides
    ADD CONSTRAINT datetime_overrides_pkey PRIMARY KEY (do_id);


--
-- Name: pipeline_failures pipeline_failures_pf_stage_pf_identifier_key; Type: CONSTRAINT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.pipeline_failures
    ADD CONSTRAINT pipeline_failures_pf_stage_pf_identifier_key UNIQUE (pf_stage, pf_identifier);


--
-- Name: pipeline_failures pipeline_failures_pkey; Type: CONSTRAINT; Schema: pipeline_ledger; Owner: -
--

ALTER TABLE ONLY pipeline_ledger.pipeline_failures
    ADD CONSTRAINT pipeline_failures_pkey PRIMARY KEY (pf_id);


--
-- Name: audio_journals audio_journals_aj_day_aj_session_subject_id_study_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_journals
    ADD CONSTRAINT audio_journals_aj_day_aj_session_subject_id_study_id_key UNIQUE (aj_day, aj_session, subject_id, study_id);


--
-- Name: audio_journals audio_journals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_journals
    ADD CONSTRAINT audio_journals_pkey PRIMARY KEY (aj_path);


--
-- Name: dashboard_actions dashboard_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_actions
    ADD CONSTRAINT dashboard_actions_pkey PRIMARY KEY (da_id);


--
-- Name: decrypted_files decrypted_files_destination_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decrypted_files
    ADD CONSTRAINT decrypted_files_destination_path_key UNIQUE (destination_path);


--
-- Name: decrypted_files decrypted_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decrypted_files
    ADD CONSTRAINT decrypted_files_pkey PRIMARY KEY (source_path);


--
-- Name: expected_interviews expected_interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expected_interviews
    ADD CONSTRAINT expected_interviews_pkey PRIMARY KEY (interview_name);


--
-- Name: exported_assets exported_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exported_assets
    ADD CONSTRAINT exported_assets_pkey PRIMARY KEY (asset_path);


--
-- Name: fau_role_validation fau_role_validation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fau_role_validation
    ADD CONSTRAINT fau_role_validation_pkey PRIMARY KEY (interview_name);


--
-- Name: ffprobe_metadata_audio ffprobe_metadata_audio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ffprobe_metadata_audio
    ADD CONSTRAINT ffprobe_metadata_audio_pkey PRIMARY KEY (fma_source_path);


--
-- Name: ffprobe_metadata ffprobe_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ffprobe_metadata
    ADD CONSTRAINT ffprobe_metadata_pkey PRIMARY KEY (fm_source_path);


--
-- Name: ffprobe_metadata_video ffprobe_metadata_video_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ffprobe_metadata_video
    ADD CONSTRAINT ffprobe_metadata_video_pkey PRIMARY KEY (fmv_source_path);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (file_path);


--
-- Name: form_data form_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_data
    ADD CONSTRAINT form_data_pkey PRIMARY KEY (subject_id, study_id, form_name, event_name);


--
-- Name: interview_files interview_files_interview_file_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_files
    ADD CONSTRAINT interview_files_interview_file_key UNIQUE (interview_file);


--
-- Name: interview_files interview_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_files
    ADD CONSTRAINT interview_files_pkey PRIMARY KEY (interview_path, interview_file);


--
-- Name: interview_parts interview_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_parts
    ADD CONSTRAINT interview_parts_pkey PRIMARY KEY (interview_path);


--
-- Name: interview_roles interview_roles_ir_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_roles
    ADD CONSTRAINT interview_roles_ir_role_key UNIQUE (ir_role);


--
-- Name: interview_types interview_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_types
    ADD CONSTRAINT interview_types_pkey PRIMARY KEY (interview_type);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (interview_name);


--
-- Name: key_store key_store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.key_store
    ADD CONSTRAINT key_store_pkey PRIMARY KEY (name);


--
-- Name: llm_language_identification llm_language_identification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.llm_language_identification
    ADD CONSTRAINT llm_language_identification_pkey PRIMARY KEY (llm_source_transcript, ollama_model_identifier);


--
-- Name: llm_speaker_identification llm_speaker_identification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.llm_speaker_identification
    ADD CONSTRAINT llm_speaker_identification_pkey PRIMARY KEY (llm_source_transcript, ollama_model_identifier, llm_role);


--
-- Name: load_openface load_openface_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.load_openface
    ADD CONSTRAINT load_openface_pkey PRIMARY KEY (interview_name);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (log_id);


--
-- Name: manual_qc manual_qc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_qc
    ADD CONSTRAINT manual_qc_pkey PRIMARY KEY (qc_target_id, qc_target_type);


--
-- Name: openface openface_of_processed_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface
    ADD CONSTRAINT openface_of_processed_path_key UNIQUE (of_processed_path);


--
-- Name: openface openface_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface
    ADD CONSTRAINT openface_pkey PRIMARY KEY (vs_path);


--
-- Name: openface_qc openface_qc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface_qc
    ADD CONSTRAINT openface_qc_pkey PRIMARY KEY (of_processed_path);


--
-- Name: pdf_reports pdf_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdf_reports
    ADD CONSTRAINT pdf_reports_pkey PRIMARY KEY (interview_name, pr_version);


--
-- Name: study study_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study
    ADD CONSTRAINT study_pkey PRIMARY KEY (study_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (study_id, subject_id);


--
-- Name: transcript_files transcript_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript_files
    ADD CONSTRAINT transcript_files_pkey PRIMARY KEY (transcript_file);


--
-- Name: video_quick_qc video_quick_qc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_quick_qc
    ADD CONSTRAINT video_quick_qc_pkey PRIMARY KEY (video_path);


--
-- Name: video_streams video_streams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_streams
    ADD CONSTRAINT video_streams_pkey PRIMARY KEY (vs_path);


--
-- Name: video_streams video_streams_video_path_ir_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_streams
    ADD CONSTRAINT video_streams_video_path_ir_role_key UNIQUE (video_path, ir_role);


--
-- Name: audio_qc audio_qc_pkey; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.audio_qc
    ADD CONSTRAINT audio_qc_pkey PRIMARY KEY (aqc_source_path);


--
-- Name: redacted_transcripts redacted_transcripts_pkey; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.redacted_transcripts
    ADD CONSTRAINT redacted_transcripts_pkey PRIMARY KEY (unredacted_transcript_path);


--
-- Name: transcribeme_pull transcribeme_pull_pkey; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.transcribeme_pull
    ADD CONSTRAINT transcribeme_pull_pkey PRIMARY KEY (transcription_destination_path);


--
-- Name: transcribeme_push transcribeme_push_pkey; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.transcribeme_push
    ADD CONSTRAINT transcribeme_push_pkey PRIMARY KEY (transcription_source_path);


--
-- Name: transcribeme_push transcribeme_push_unique_destination; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.transcribeme_push
    ADD CONSTRAINT transcribeme_push_unique_destination UNIQUE (transcription_destination_path);


--
-- Name: wav_conversion wav_conversion_pkey; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.wav_conversion
    ADD CONSTRAINT wav_conversion_pkey PRIMARY KEY (wc_source_path);


--
-- Name: wav_conversion wav_conversion_wc_destination_path_key; Type: CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.wav_conversion
    ADD CONSTRAINT wav_conversion_wc_destination_path_key UNIQUE (wc_destination_path);


--
-- Name: datetime_overrides_identifier_idx; Type: INDEX; Schema: pipeline_ledger; Owner: -
--

CREATE INDEX datetime_overrides_identifier_idx ON pipeline_ledger.datetime_overrides USING btree (do_identifier);


--
-- Name: pipeline_failures_error_code_idx; Type: INDEX; Schema: pipeline_ledger; Owner: -
--

CREATE INDEX pipeline_failures_error_code_idx ON pipeline_ledger.pipeline_failures USING btree (pf_error_code);


--
-- Name: pipeline_failures_study_id_idx; Type: INDEX; Schema: pipeline_ledger; Owner: -
--

CREATE INDEX pipeline_failures_study_id_idx ON pipeline_ledger.pipeline_failures USING btree (pf_study_id);


--
-- Name: pipeline_failures_subject_id_idx; Type: INDEX; Schema: pipeline_ledger; Owner: -
--

CREATE INDEX pipeline_failures_subject_id_idx ON pipeline_ledger.pipeline_failures USING btree (pf_subject_id);


--
-- Name: idx_audio_qc_source_path_passed; Type: INDEX; Schema: transcribeme; Owner: -
--

CREATE INDEX idx_audio_qc_source_path_passed ON transcribeme.audio_qc USING btree (aqc_source_path, aqc_passed);


--
-- Name: audio_qc audio_qc_qc_source_path_fkey; Type: FK CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.audio_qc
    ADD CONSTRAINT audio_qc_qc_source_path_fkey FOREIGN KEY (qc_source_path) REFERENCES public.files(file_path);


--
-- Name: lld_extraction lld_extraction_lld_source_path_fkey; Type: FK CONSTRAINT; Schema: acoustics; Owner: -
--

ALTER TABLE ONLY acoustics.lld_extraction
    ADD CONSTRAINT lld_extraction_lld_source_path_fkey FOREIGN KEY (lld_source_path) REFERENCES acoustics.audio_qc(qc_source_path);


--
-- Name: facepipe_qc facepipe_qc_fp_source_video_path_fkey; Type: FK CONSTRAINT; Schema: facepipe; Owner: -
--

ALTER TABLE ONLY facepipe.facepipe_qc
    ADD CONSTRAINT facepipe_qc_fp_source_video_path_fkey FOREIGN KEY (fp_source_video_path) REFERENCES facepipe.facepipe_runs(fp_source_video_path) ON DELETE CASCADE;


--
-- Name: facepipe_runs facepipe_runs_fp_source_video_path_fkey; Type: FK CONSTRAINT; Schema: facepipe; Owner: -
--

ALTER TABLE ONLY facepipe.facepipe_runs
    ADD CONSTRAINT facepipe_runs_fp_source_video_path_fkey FOREIGN KEY (fp_source_video_path) REFERENCES public.video_quick_qc(video_path) ON DELETE CASCADE;


--
-- Name: audio_journals audio_journals_aj_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_journals
    ADD CONSTRAINT audio_journals_aj_path_fkey FOREIGN KEY (aj_path) REFERENCES public.files(file_path);


--
-- Name: audio_journals audio_journals_subject_id_study_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_journals
    ADD CONSTRAINT audio_journals_subject_id_study_id_fkey FOREIGN KEY (subject_id, study_id) REFERENCES public.subjects(subject_id, study_id);


--
-- Name: decrypted_files decrypted_files_source_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decrypted_files
    ADD CONSTRAINT decrypted_files_source_path_fkey FOREIGN KEY (source_path) REFERENCES public.interview_files(interview_file);


--
-- Name: expected_interviews expected_interviews_subject_id_study_id_form_name_event_na_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expected_interviews
    ADD CONSTRAINT expected_interviews_subject_id_study_id_form_name_event_na_fkey FOREIGN KEY (subject_id, study_id, form_name, event_name) REFERENCES public.form_data(subject_id, study_id, form_name, event_name);


--
-- Name: fau_role_validation fau_role_validation_interview_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fau_role_validation
    ADD CONSTRAINT fau_role_validation_interview_name_fkey FOREIGN KEY (interview_name) REFERENCES public.load_openface(interview_name);


--
-- Name: ffprobe_metadata_audio ffprobe_metadata_audio_fma_source_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ffprobe_metadata_audio
    ADD CONSTRAINT ffprobe_metadata_audio_fma_source_path_fkey FOREIGN KEY (fma_source_path) REFERENCES public.ffprobe_metadata(fm_source_path);


--
-- Name: ffprobe_metadata_video ffprobe_metadata_video_fmv_source_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ffprobe_metadata_video
    ADD CONSTRAINT ffprobe_metadata_video_fmv_source_path_fkey FOREIGN KEY (fmv_source_path) REFERENCES public.ffprobe_metadata(fm_source_path);


--
-- Name: form_data form_data_subject_id_study_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_data
    ADD CONSTRAINT form_data_subject_id_study_id_fkey FOREIGN KEY (subject_id, study_id) REFERENCES public.subjects(subject_id, study_id);


--
-- Name: interview_files interview_files_interview_file_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_files
    ADD CONSTRAINT interview_files_interview_file_fkey FOREIGN KEY (interview_file) REFERENCES public.files(file_path);


--
-- Name: interview_files interview_files_interview_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_files
    ADD CONSTRAINT interview_files_interview_path_fkey FOREIGN KEY (interview_path) REFERENCES public.interview_parts(interview_path);


--
-- Name: interview_parts interview_parts_interview_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_parts
    ADD CONSTRAINT interview_parts_interview_name_fkey FOREIGN KEY (interview_name) REFERENCES public.interviews(interview_name);


--
-- Name: interviews interviews_interview_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interview_type_fkey FOREIGN KEY (interview_type) REFERENCES public.interview_types(interview_type);


--
-- Name: interviews interviews_subject_id_study_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_subject_id_study_id_fkey FOREIGN KEY (subject_id, study_id) REFERENCES public.subjects(subject_id, study_id);


--
-- Name: llm_language_identification llm_language_identification_llm_source_transcript_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.llm_language_identification
    ADD CONSTRAINT llm_language_identification_llm_source_transcript_fkey FOREIGN KEY (llm_source_transcript) REFERENCES public.transcript_files(transcript_file);


--
-- Name: llm_speaker_identification llm_speaker_identification_llm_source_transcript_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.llm_speaker_identification
    ADD CONSTRAINT llm_speaker_identification_llm_source_transcript_fkey FOREIGN KEY (llm_source_transcript) REFERENCES public.transcript_files(transcript_file);


--
-- Name: load_openface load_openface_subject_id_study_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.load_openface
    ADD CONSTRAINT load_openface_subject_id_study_id_fkey FOREIGN KEY (subject_id, study_id) REFERENCES public.subjects(subject_id, study_id);


--
-- Name: load_openface load_openface_subject_of_processed_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.load_openface
    ADD CONSTRAINT load_openface_subject_of_processed_path_fkey FOREIGN KEY (subject_of_processed_path) REFERENCES public.openface(of_processed_path);


--
-- Name: openface_qc openface_qc_of_processed_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface_qc
    ADD CONSTRAINT openface_qc_of_processed_path_fkey FOREIGN KEY (of_processed_path) REFERENCES public.openface(of_processed_path);


--
-- Name: openface openface_video_path_ir_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface
    ADD CONSTRAINT openface_video_path_ir_role_fkey FOREIGN KEY (video_path, ir_role) REFERENCES public.video_streams(video_path, ir_role);


--
-- Name: openface openface_vs_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openface
    ADD CONSTRAINT openface_vs_path_fkey FOREIGN KEY (vs_path) REFERENCES public.video_streams(vs_path);


--
-- Name: pdf_reports pdf_reports_interview_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdf_reports
    ADD CONSTRAINT pdf_reports_interview_name_fkey FOREIGN KEY (interview_name) REFERENCES public.load_openface(interview_name);


--
-- Name: subjects subjects_study_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_study_id_fkey FOREIGN KEY (study_id) REFERENCES public.study(study_id);


--
-- Name: transcript_files transcript_files_transcript_file_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript_files
    ADD CONSTRAINT transcript_files_transcript_file_fkey FOREIGN KEY (transcript_file) REFERENCES public.files(file_path);


--
-- Name: video_quick_qc video_quick_qc_video_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_quick_qc
    ADD CONSTRAINT video_quick_qc_video_path_fkey FOREIGN KEY (video_path) REFERENCES public.decrypted_files(destination_path);


--
-- Name: video_streams video_streams_ir_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_streams
    ADD CONSTRAINT video_streams_ir_role_fkey FOREIGN KEY (ir_role) REFERENCES public.interview_roles(ir_role);


--
-- Name: video_streams video_streams_video_path_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_streams
    ADD CONSTRAINT video_streams_video_path_fkey FOREIGN KEY (video_path) REFERENCES public.video_quick_qc(video_path);


--
-- Name: audio_qc audio_qc_aqc_source_path_fkey; Type: FK CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.audio_qc
    ADD CONSTRAINT audio_qc_aqc_source_path_fkey FOREIGN KEY (aqc_source_path) REFERENCES transcribeme.wav_conversion(wc_destination_path);


--
-- Name: redacted_transcripts redacted_transcripts_unredacted_transcript_path_fkey; Type: FK CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.redacted_transcripts
    ADD CONSTRAINT redacted_transcripts_unredacted_transcript_path_fkey FOREIGN KEY (unredacted_transcript_path) REFERENCES transcribeme.transcribeme_pull(transcription_destination_path);


--
-- Name: transcribeme_pull transcribeme_pull_transcription_destination_path_fkey; Type: FK CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.transcribeme_pull
    ADD CONSTRAINT transcribeme_pull_transcription_destination_path_fkey FOREIGN KEY (transcription_destination_path) REFERENCES transcribeme.transcribeme_push(transcription_destination_path);


--
-- Name: transcribeme_push transcribeme_push_transcription_source_path_fkey; Type: FK CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.transcribeme_push
    ADD CONSTRAINT transcribeme_push_transcription_source_path_fkey FOREIGN KEY (transcription_source_path) REFERENCES transcribeme.wav_conversion(wc_destination_path);


--
-- Name: wav_conversion wav_conversion_wc_source_path_fkey; Type: FK CONSTRAINT; Schema: transcribeme; Owner: -
--

ALTER TABLE ONLY transcribeme.wav_conversion
    ADD CONSTRAINT wav_conversion_wc_source_path_fkey FOREIGN KEY (wc_source_path) REFERENCES public.files(file_path) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Jh0H05jnjV8RFDaddph7VNfgEhxEVTv6KHFCKb6pItImKYEKuU3tLt4lJtPEqPi

