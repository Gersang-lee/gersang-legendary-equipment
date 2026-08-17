# 거상 전설장비 재료도감

장수 전용 아이템을 복수 선택하면, 해당 아이템이 제작 재료로 사용되는 전설장수 전용 무기를 찾아 보여주고 결과를 이미지로 저장하는 웹사이트입니다.

## 핵심 기능

- 장수 전용 아이템 복수 선택
- 선택한 아이템을 사용하는 전설장수 및 전용 무기 표시
- 중복 전설장수 결과 병합
- 실제 전설장수 무기·하위 장비 아이콘 표시
- 선택 결과를 PNG 이미지로 저장
- 모바일·PC 반응형 화면

## 데이터 범위

- 전설장수 15명
- 전설장수 전용 무기 15종
- 중복 제거된 하위 전용 장비 29종
- 기본 무기와 봉인된 힘의 조각은 선택 대상에서 제외

## 권장 화면 흐름

1. 하위 장비 목록에서 아이템을 여러 개 선택합니다.
2. 선택된 아이템을 재료로 사용하는 전설장수 무기가 자동으로 표시됩니다.
3. 결과 카드에는 전설장수 무기 이미지, 무기명, 선택된 하위 장비가 표시됩니다.
4. `이미지로 저장` 버튼을 누르면 현재 결과를 PNG로 내려받습니다.

## 이관 자료

- `assets/item-icons/`: 실제 장비 아이콘
- `references/거상_전설장수_무기_하위재료.png`: 전체 관계표 이미지
- `references/source/`: 아이콘 수집 및 표 생성 과정의 참고 자료

## 저장소명

`gersang-legendary-materials`

## 실행 방법

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

표시된 로컬 주소로 접속한 뒤 하위 장비를 복수 선택합니다. 결과 영역의 `PNG로 저장` 버튼은 현재 일치 결과만 2배 해상도의 PNG로 직접 렌더링합니다.

## 빌드 및 테스트

```bash
npm test
npm run build
npm run preview
```

`docs/` 디렉터리가 GitHub Pages용 정적 HTML 결과물입니다. 저장소에 `docs/`를 함께 커밋한 뒤 GitHub 저장소의 **Settings → Pages → Build and deployment**에서 `Deploy from a branch`, 브랜치 `main`, 폴더 `/docs`를 선택하면 됩니다.

`base: './'` 상대 경로 설정이 적용되어 있어 `https://사용자명.github.io/저장소명/` 같은 하위 경로에서도 별도 수정 없이 아이콘과 스크립트가 로드됩니다.

## 주요 구조

- `src/data.js`: 29개 하위 장비와 15개 전설장수 무기의 관계 데이터
- `src/main.jsx`: 검색, 복수 선택, 결과 필터링 UI
- `src/exportImage.js`: 로컬 아이콘 기반 고해상도 PNG 렌더러
- `src/styles.css`: PC·모바일 반응형 디자인
- `assets/item-icons/`: 전설 무기 및 하위 장비 로컬 아이콘 (`vite.config.js`에서 정적 자산 원본으로 지정)
"# gersang-legendary-equipment" 
