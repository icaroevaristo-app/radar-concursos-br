# Radar Concursos BR — Modelo de Dados Conceitual V1.0

## 1. Objetivo

Definir as entidades principais do sistema sem criar SQL ainda.

## 2. Entidades

## User

Representa o usuário final.

Campos:

- id
- name
- email
- password_hash
- phone
- city
- state
- latitude
- longitude
- education_level
- subscription_status
- created_at
- updated_at

## UserPreference

Preferências usadas para matching.

Campos:

- id
- user_id
- states
- cities
- radius_km
- education_levels
- desired_roles
- areas
- min_salary
- accepts_temporary
- accepts_reserve_list
- accepts_remote_or_other_city_exam
- notification_channels
- notification_frequency
- created_at
- updated_at

## Source

Fonte monitorada.

Campos:

- id
- name
- type
- base_url
- city
- state
- reliability_score
- crawl_frequency
- crawler_strategy
- status
- last_crawled_at
- created_at
- updated_at

Tipos possíveis:

- board
- city_hall
- city_council
- official_diary
- contest_portal
- state_agency
- autarchy
- other

## CrawlRun

Execução de crawler.

Campos:

- id
- source_id
- started_at
- finished_at
- status
- documents_found
- documents_new
- documents_duplicated
- error_message
- created_at

## RawDocument

Documento bruto encontrado.

Campos:

- id
- source_id
- crawl_run_id
- url
- file_url
- file_type
- raw_text
- storage_path
- hash
- discovered_at
- status
- created_at
- updated_at

Status possíveis:

- discovered
- downloaded
- extracted
- classified
- failed
- ignored
- duplicated

## ExtractedDocument

Resultado da classificação e extração.

Campos:

- id
- raw_document_id
- document_type
- extracted_json
- confidence_score
- model_used
- validation_status
- validation_errors
- created_at
- updated_at

Tipos de documento:

- opening_notice
- rectification
- result
- convocations
- homologation
- exam_location
- temporary_selection
- news
- irrelevant
- unknown

## Contest

Concurso publicado ou em rascunho.

Campos:

- id
- title
- organization
- sphere
- city
- state
- latitude
- longitude
- board
- status
- official_url
- source_id
- raw_document_id
- confidence_score
- publication_status
- published_at
- created_at
- updated_at

Status possíveis:

- draft
- open
- upcoming
- closed
- suspended
- canceled
- finished
- archived

Publication status:

- pending
- published
- unpublished
- needs_review
- rejected

## ContestRole

Cargo do concurso.

Campos:

- id
- contest_id
- role_name
- area
- education_level
- salary
- salary_text
- vacancies
- reserve_list
- workload
- requirements
- created_at
- updated_at

## ContestDate

Datas e eventos do concurso.

Campos:

- id
- contest_id
- event_type
- date_start
- date_end
- description
- is_estimated
- confidence_score
- created_at
- updated_at

Tipos de evento:

- registration_start
- registration_end
- payment_due
- exam_date
- exam_location
- result
- appeal_period
- convocation
- other

## ContestSummary

Resumo gerado/armazenado.

Campos:

- id
- contest_id
- simple_summary
- attention_points
- eligibility_notes
- study_topics
- checklist_template
- generated_by_ai
- reviewed
- created_at
- updated_at

## SavedContest

Concurso salvo pelo usuário.

Campos:

- id
- user_id
- contest_id
- status
- notes
- created_at
- updated_at

Status:

- saved
- interested
- registered
- paid
- exam_scheduled
- abandoned
- finished

## UserChecklistItem

Checklist individual do usuário para um concurso.

Campos:

- id
- user_id
- contest_id
- title
- description
- due_date
- completed
- completed_at
- created_at
- updated_at

## MatchingResult

Resultado do cruzamento entre usuário e concurso.

Campos:

- id
- user_id
- contest_id
- score
- match_level
- reasons
- disqualifiers
- created_at
- updated_at

Match level:

- strong
- medium
- weak
- not_recommended

## Notification

Notificação enviada ou agendada.

Campos:

- id
- user_id
- contest_id
- type
- channel
- subject
- body
- scheduled_at
- sent_at
- status
- provider_response
- created_at
- updated_at

Tipos:

- new_match
- registration_ending
- payment_due
- exam_soon
- rectification
- exam_location
- result
- convocation

Status:

- pending
- sent
- failed
- canceled
- skipped

## Subscription

Assinatura do usuário.

Campos:

- id
- user_id
- plan
- status
- provider
- provider_subscription_id
- started_at
- current_period_end
- canceled_at
- created_at
- updated_at

Planos:

- free
- basic
- pro
- annual

Status:

- active
- trialing
- past_due
- canceled
- expired

## AuditLog

Registro de alterações importantes.

Campos:

- id
- actor_type
- actor_id
- action
- entity_type
- entity_id
- before
- after
- created_at

## 3. Relacionamentos Principais

- User possui uma UserPreference.
- User possui muitos SavedContest.
- User possui muitos MatchingResult.
- User possui muitas Notification.
- Source possui muitos CrawlRun.
- CrawlRun possui muitos RawDocument.
- RawDocument possui um ou muitos ExtractedDocument.
- RawDocument pode originar Contest.
- Contest possui muitos ContestRole.
- Contest possui muitos ContestDate.
- Contest possui um ContestSummary.
- Contest possui muitos MatchingResult.
- Contest possui muitas Notification.
- Contest pode estar vinculado a Source.
- Subscription pertence a User.
