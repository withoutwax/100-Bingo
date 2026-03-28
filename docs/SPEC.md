# SPEC.md: Multiplayer Custom Bingo Game

## 1. Project Overview

본 프로젝트는 유저가 직접 보드 크기와 승리 패턴을 설정하고, 다른 플레이어들과 실시간으로 숫자를 맞추며 경쟁하는 멀티플레이어 웹 빙고 게임입니다.

## 2. Technology Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend/Database:** Firebase Firestore (Real-time Database)
- **Authentication:** Firebase Auth (Anonymous Login or Simple Nickname Auth)
- **Hosting:** Vercel (or Firebase Hosting)

## 3. Core Features

### 3.1. Lobby & Matchmaking

- **방 생성:** 호스트가 새로운 게임 방을 생성합니다.
- **비밀번호 설정:** 공개 방(Public)과 비밀번호가 있는 비공개 방(Private)을 지원합니다.
- **방 목록 검색:** 로비에서 현재 대기 중인 방의 목록을 조회하고 검색할 수 있습니다.
- **초대 시스템:** 생성된 방의 고유 URL 링크를 복사하여 다른 사람을 초대할 수 있습니다.

### 3.2. Game Configuration (Host Only)

- **그리드 크기 설정:** 5x5(25칸), 10x10(100칸) 등 보드의 크기를 선택합니다.
- **숫자 범위 연동:** 선택된 그리드 크기에 맞춰 사용 가능한 숫자의 최대 범위가 자동으로 결정됩니다 (예: 10x10 선택 시 1~100 사용).
- **승리 패턴 설정:** 기본 빙고(가로/세로/대각선 n줄) 외에 특정 모양(X자, 테두리 등)을 커스텀 목표로 설정할 수 있습니다.

### 3.3. Gameplay Mechanics

- **보드 초기화:** 플레이어는 게임 시작 전 자신의 보드에 숫자를 무작위 또는 수동으로 배치합니다.
- **턴제 진행:** 게임이 시작되면 플레이어들이 정해진 순서대로 돌아가며 숫자를 하나씩 선택합니다.
- **실시간 마킹:** 한 플레이어가 숫자를 부르면(선택하면), 해당 방에 있는 모든 플레이어의 보드에서 그 숫자가 실시간으로 마크(체크) 처리됩니다.
- **승리 조건 판별:** 클라이언트 및 Firestore 규칙을 통해 설정된 빙고 패턴을 가장 먼저 완성한 플레이어를 감지하고 승리 처리합니다.

## 4. Firestore Database Schema

Firestore의 NoSQL 컬렉션-문서 구조를 기반으로 설계합니다.

### Collection: `rooms`

방의 메타데이터와 현재 게임의 전반적인 상태를 관리합니다.

| Field           | Type         | Description                                |
| :-------------- | :----------- | :----------------------------------------- |
| `roomId`        | String       | 방의 고유 ID (Document ID)                 |
| `hostId`        | String       | 방장의 고유 ID                             |
| `password`      | String       | 방 비밀번호 (없을 경우 null)               |
| `gridSize`      | Number       | 보드 크기 (예: 5, 10)                      |
| `winPattern`    | String/Array | 승리 조건 패턴 데이터                      |
| `status`        | String       | 방 상태 ('waiting', 'playing', 'finished') |
| `turnIndex`     | Number       | 현재 숫자를 고를 차례인 플레이어의 인덱스  |
| `calledNumbers` | Array        | 지금까지 불려진 숫자들의 배열              |
| `createdAt`     | Timestamp    | 방 생성 시간                               |

### Sub-collection: `rooms/{roomId}/players`

해당 방에 참가한 플레이어들의 개별 상태와 보드 데이터를 관리합니다.

| Field      | Type      | Description                                 |
| :--------- | :-------- | :------------------------------------------ |
| `playerId` | String    | 플레이어 고유 ID (Document ID)              |
| `nickname` | String    | 플레이어 화면 표시 이름                     |
| `isReady`  | Boolean   | 게임 시작 준비 완료 여부                    |
| `board`    | Array     | 플레이어의 숫자 배치 데이터 (1D Array 추천) |
| `joinedAt` | Timestamp | 방 입장 시간 (턴 순서 결정에 사용)          |

## 5. Security & Data Flow

- **onSnapshot:** 프론트엔드에서는 `rooms` 문서와 `players` 하위 컬렉션에 `onSnapshot` 리스너를 달아 상태 변화를 실시간으로 화면에 렌더링합니다.
- **Transaction/Batch:** 턴을 넘기고 숫자를 추가하는 작업(`turnIndex` 업데이트 + `calledNumbers` 추가)은 데이터 무결성을 위해 Firestore Transaction을 사용하여 원자적으로(Atomically) 처리합니다.
