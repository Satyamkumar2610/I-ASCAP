--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg110+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-1.pgdg110+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agri_metrics; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.agri_metrics (
    id integer NOT NULL,
    cdk text,
    year integer,
    variable_name text,
    value real,
    source text DEFAULT 'ICRISAT'::text
);


ALTER TABLE public.agri_metrics OWNER TO "user";

--
-- Name: agri_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.agri_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.agri_metrics_id_seq OWNER TO "user";

--
-- Name: agri_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.agri_metrics_id_seq OWNED BY public.agri_metrics.id;


--
-- Name: districts; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.districts (
    cdk text NOT NULL,
    state_name text,
    district_name text,
    start_year integer,
    end_year integer
);


ALTER TABLE public.districts OWNER TO "user";

--
-- Name: agri_metrics id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.agri_metrics ALTER COLUMN id SET DEFAULT nextval('public.agri_metrics_id_seq'::regclass);


--
-- Name: agri_metrics agri_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.agri_metrics
    ADD CONSTRAINT agri_metrics_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (cdk);


--
-- Name: agri_metrics agri_metrics_cdk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.agri_metrics
    ADD CONSTRAINT agri_metrics_cdk_fkey FOREIGN KEY (cdk) REFERENCES public.districts(cdk);


--
-- PostgreSQL database dump complete
--

