# 관세율 카드 챌린지 (Tariff Lab)

무역실무 수업에서 관세율의 종류와 법정 적용 우선순위를 학습하는 **웹 기반 카드 퀴즈**입니다. GitHub Pages에서 무료로 정적 호스팅할 수 있으며, 서버·데이터베이스·프레임워크 설치가 필요 없습니다.

## 게임 구성

| 라운드 | 방식 | 문항 | 최고 기본 점수 |
|---|---|---:|---:|
| 1. 관세율 종류 | 관세율과 설명 카드 매칭 | 8 | 80 |
| 2. 적용 우선순위 | 관세법에 따른 그룹을 순서대로 선택 | 6 | 90 |
| 3. 실전 판단 | 가상 수입통관 사례 객관식 | 5 | 100 |
| 합계 | | **19** | **270** |

정답을 맞히면 점수를 얻고, 오답을 선택할 때마다 2점씩 감점합니다(총점 0점 미만 없음). 학습 현황은 기기의 브라우저 `localStorage`에만 저장되며, 별도 서버에 전송되지 않습니다.

## 파일 구성

```
tariff-card-quiz/
├── index.html     # 화면 구성과 법령 링크
├── style.css      # 반응형 디자인
├── app.js         # 문제 데이터와 게임 로직
└── README.md      # 사용·배포 설명
```

## 바로 실행하기

1. 이 폴더에서 `index.html` 파일을 더블클릭합니다.
2. Chrome, Edge, Safari 등 최신 웹 브라우저로 게임이 열립니다.
3. 1~3라운드를 선택해 학습합니다. 페이지를 새로고침해도 같은 브라우저에서는 학습 기록이 유지됩니다.

> 외부 폰트·이미지·스크립트를 불러오지 않아 인터넷 없이도 게임이 작동합니다.

## GitHub Pages 배포하기

### 웹에서 올리는 가장 쉬운 방법

1. GitHub에서 **New repository**를 클릭하고 예를 들어 `tariff-card-quiz`라는 이름으로 공개(Public) 저장소를 만듭니다.
2. **Add file → Upload files**를 클릭한 후 `index.html`, `style.css`, `app.js`, `README.md`를 저장소 **최상위(root)** 에 올리고 변경사항을 커밋합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**를 **Deploy from a branch**로 설정합니다.
5. **Branch**에서 `main`과 `/ (root)`를 선택하고 **Save**합니다.
6. GitHub Pages 배포가 완료되면 아래 주소로 접속합니다.

```
https://깃허브아이디.github.io/tariff-card-quiz/
```

실제 주소는 저장소 소유자와 이름에 따라 달라집니다. 배포 진행 상황은 **Actions** 또는 **Settings → Pages**에서 확인하세요.

### Git 명령어로 올리는 방법

GitHub에 빈 공개 저장소를 만들었다면 해당 폴더의 터미널에서 다음을 실행합니다.

```bash
git init
git add index.html style.css app.js README.md
git commit -m "Add tariff learning card game"
git branch -M main
git remote add origin https://github.com/깃허브아이디/tariff-card-quiz.git
git push -u origin main
```

이후 Settings → Pages에서 `main` / `(root)`를 선택합니다.

## 학습 내용 수정하기

`app.js`의 다음 배열을 수정하면 교원이 문항을 교체할 수 있습니다.

- `MATCH_ITEMS`: 관세율 용어와 설명 8쌍
- `PRIORITY_ITEMS`: 관세법에 따른 그룹 순서 및 해설 6개
- `CASES`: 사례형 객관식 문제 5개

문항 수를 변경하면 `index.html`의 진행도 안내(19문제), `app.js`의 총점 계산과 진행도 분모 등을 함께 수정해야 합니다.

## 법령과 교육상 유의사항

2026년 11월 23일 확인 기준으로 다음 법령을 토대로 퀴즈를 작성했습니다.

- [관세법 제50조: 세율 적용의 우선순위](https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1026599107)
- [자유무역협정(FTA)관세법 제5조: 세율 적용의 우선순위](https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0005&lsiSeq=276141&urlMode=lsScJoRltInfoR)

**법정 순위는 무조건 기계적으로 높은 순위를 선택하라는 의미가 아닙니다.** 국제협력관세와 할당관세 등에는 세율의 높낮이에 대한 적용 조건이 있으며, 일부 농림축산물은 예외가 있습니다. FTA 세율은 별도의 적용 규정을 따르고, 덤핑방지관세 등 무역구제관세는 추가로 부과될 수 있습니다. 게임의 수치와 사례는 교육 목적의 가상 사례이며 실제 통관 신고에 사용해서는 안 됩니다.

## 기술 및 개인정보

- HTML5, CSS3, Vanilla JavaScript만 사용
- 반응형 레이아웃, 키보드 접근 가능 버튼, 음성 안내용 상태 메시지
- 로그인, 서버, 외부 통계 서비스, 광고 없음
- 진행도는 브라우저의 `localStorage`에서만 관리
- 전체 초기화 버튼으로 진행도 삭제 가능

## 라이선스

이 배포본에는 별도의 오픈소스 라이선스를 부여하지 않았습니다. 공개 저장소로 업로드하는 것과 제3자의 코드 재사용을 허용하는 것은 다르므로, 재사용을 허용하려면 저장소 소유자가 적절한 `LICENSE` 파일을 추가하세요.

