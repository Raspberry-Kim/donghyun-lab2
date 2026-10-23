# donghyun-lab2 GitHub 게시 안내

동현파는 `Raspberry-Kim/donghyun-lab2` 저장소의 `main` 브랜치 루트에서 GitHub Pages로 제공한다. [동현파 바로 실행](https://raspberry-kim.github.io/donghyun-lab2/) · [GitHub 저장소](https://github.com/Raspberry-Kim/donghyun-lab2)

## 같은 구조로 새로 게시하는 방법

GitHub에서 `New repository`를 열고 이름을 `donghyun-lab2`, 공개 범위를 `Public`으로 설정한다. README·라이선스·gitignore는 이미 포함했으므로 초기 생성 옵션은 선택하지 않는다.

About 소개에는 다음 문구를 권장한다.

```text
공개된 선충의 279뉴런 연결망을 동현랭으로 깨운다. 작은 소녀의 커다란 글러브에 분홍 선충이 꿈틀거리는 촉각 회로실험실, 동현파™.
```

ZIP을 풀어 `donghyun-lab2` 폴더 안의 파일·하위 폴더를 저장소 루트에 올린다. `index.html`, `README.md`, `LICENSE`가 첫 화면에 보여야 하며 ZIP 파일 자체만 올리면 웹 앱이 실행되지 않는다.

## GitHub Pages

`Settings → Pages`에서 `Source: Deploy from a branch`, `Branch: main`, `Folder: / (root)`로 지정하고 저장한다. 배포 완료 후 GitHub가 표시하는 `Visit site`로 확인한다. [GitHub Pages 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

`Raspberry-Kim` 계정에 위 이름으로 게시했다면 주소는 다음과 같다.

```text
https://raspberry-kim.github.io/donghyun-lab2/
```

About의 Website에도 실제 배포 주소를 넣는다. Topics는 `donghyun-lang`, `c-elegans`, `connectome`, `educational`, `simulation`, `pixel-art` 정도를 권장한다.

## 공개 전 확인

- 01번에서 오른손 잽 뒤 선충의 신경 활성·밀림이 보이는가?
- 09번에서 오른손·왼손 기술이 순서대로 바뀌는가?
- 10~19번에서 복합 기술이 순서대로 진행되고, 마지막 20번은 시간·접촉 없이 끝나는가?
- 모델과 출처의 문서와 라이선스가 실제 HTML 서식으로 보이는가?
- 가공 데이터 JSON 다운로드가 작동하는가?

ODbL 고지와 데이터 접근 수단을 유지해야 한다. 최소 HTML만 게시하더라도 내장 고지·JSON 다운로드를 삭제하지 않고, 재사용자가 원본과 변환 코드를 찾을 수 있도록 전체 저장소를 함께 보존하는 것을 권장한다.

## 다음 수정

`src/`와 원문 문서를 수정하고 `npm test`, `npm run build`를 실행한다. 생성된 루트 `index.html`과 바뀐 소스·문서를 함께 커밋하면 된다. 완성 HTML과 원본이 달라지지 않게 주의한다.
