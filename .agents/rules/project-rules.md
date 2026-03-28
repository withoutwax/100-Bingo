---
trigger: always_on
---

# 🤖 Antigravity AI Agent Rules for Multiplayer Custom Bingo Game

## 1. Core Directives (핵심 지침)

- **Spec-First (절대 규칙):** 코드를 작성하거나 시스템 구조를 제안하기 전에, 반드시 `docs/` 및 관련 디렉토리 하위에 있는 \*_모든 마크다운(_.md) 파일들(예: `SPEC.md`, `RULES.md` 등)을 먼저 스캔하고 읽어야 한다.
- **Spec Update:** 사용자의 요청이 기존 명세에 없는 새로운 기능이거나 아키텍처 변경을 수반할 경우, 코드를 짜기 전에 먼저 `docs/SPEC.md`를 업데이트할 것을 제안하라.
- **README Sync (필수):** 모든 주요 기능 구현이나 아키텍처 변경(예: Firestore 데이터 모델 변경, 실시간 동기화 로직 추가, 새로운 게임 룰 도입 등)이 완료되면, **반드시 `README.md`를 최신 상태로 업데이트**해야 한다.
- **Visual Architecture:** `README.md`에는 다른 개발자나 포트폴리오 리뷰어가 한눈에 파악할 수 있도록 전체 시스템 아키텍처(Next.js Client ↔ Firebase Auth & Firestore 실시간 동기화)를 텍스트 기반 다이어그램(Mermaid 등)이나 명확한 개요로 유지하라.
- **Spec vs README:** `docs/SPEC.md`는 개발을 위한 상세 명세서이고, `README.md`는 프로젝트를 파악하기 위한 '하이레벨 아키텍처 및 프로젝트 가이드'임을 인지하고 각각의 톤앤매너에 맞게 관리하라.
- **Update:** `docs/`안에 있는 모든 마크다운(\*.md)와 `README.md`에 특정 기업 이름이 들어가지 않도록 하라.

## 2. SDD & TDD Workflow (개발 방법론)

- 모든 주요 로직 개발은 **TDD (Test Driven Development)** 사이클인 `Red -> Green -> Refactor` 순서를 따른다.
- 프로덕션 코드(구현체)를 제시하기 전에, 항상 **실패하는 테스트 코드(Test Code)** 를 먼저 작성하여 사용자에게 제공하라. (예: 빙고 승리 조건 판별 로직, 1~100 숫자 범위 검증 로직 등)
- 사용자가 테스트 통과를 확인하면, 그제서야 최소한의 프로덕션 코드를 작성하고 이후 리팩토링을 진행한다.

## 3. Tech Stack & Conventions (기술 스택 및 코딩 컨벤션)

- **Backend / Database (Firebase Firestore):**
  - 별도의 Node.js/Spring 서버 없이 **Firestore를 Serverless 백엔드**로 사용한다.
  - NoSQL 데이터 구조의 특성을 살려 읽기/쓰기 비용을 최적화하고, `onSnapshot`을 활용한 실시간 상태 동기화(`rooms`, `players` 컬렉션)에 집중한다.
  - 데이터의 무결성이 중요한 게임 턴 처리 및 점수 기록은 반드시 **Firestore Transaction 또는 Batch Write**를 사용한다.
  - 데이터베이스 접근 제어를 위해 **Firebase Security Rules**를 엄격하게 작성한다.
- **Frontend (Next.js, React, TypeScript, Tailwind CSS):**
  - 명확한 타입 타이핑(Type-safety)을 유지하며, `any` 타입 사용을 엄격히 금지한다. Firestore에서 가져오는 문서 데이터는 반드시 Interface/Type으로 매핑한다.
  - 도메인별(Lobby, SetupBoard, GameBoard 등)로 폴더와 컴포넌트를 깔끔하게 분리한다.
  - Firebase 리스너(`onSnapshot`) 구독 및 해제 로직은 메모리 누수 방지를 위해 반드시 Custom Hook(`useRoomState` 등)으로 추상화하여 관리한다.
- **Communication (응답 스타일):**
  - 불필요한 서론을 생략하고 핵심 코드와 명확한 설명만 간결하게 제공한다.
  - 코드를 제시할 때는 해당 코드가 `docs/SPEC.md`의 어느 부분을 충족하는지 주석이나 짧은 설명으로 명시한다.
