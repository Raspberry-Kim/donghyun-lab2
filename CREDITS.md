# 동현파™: 전체 출처·가공 내역·이용 안내

동현파는 공개된 선충 연결망과 촉각 연구를 바탕으로 만든 교육용 실험실이다. 많은 연구자가 공개해 준 자료 덕분에 만들 수 있었다. 다만 CoMuNeLab이나 원 연구진, WormAtlas, OpenWorm, 유전체 연구기관이 만들거나 인증·후원한 프로젝트는 아니다.

## 공개 연결 데이터

**CoMuNeLab, C.ELEGANS MULTIPLEX CONNECTOME**. 뉴런 279개와 전기적 접합, 화학적 monadic 접합, 화학적 polyadic 접합의 세 층을 담고 있다. 동현파는 커밋 `9d6d48af4eb6acef31ad9999e22fbd27c2ce210b`의 자료를 쓴다.

원문·파일·라이선스: https://github.com/CoMuNeLab/C-elegans-Multiplex-Connectome

원 저장소가 인용을 요청하는 연구는 다음과 같다.

- **연결망 원 연구:** Chen BL, Hall DH, Chklovskii DB. Wiring optimization can relate neuronal structure and function. PNAS 103(12), 4723–4728 (2006). http://www.pnas.org/content/103/12/4723.abstract
- **다층 네트워크 도구:** De Domenico M, Porter MA, Arenas A. MuxViz: A Tool for Multilayer Analysis and Visualization of Networks. Journal of Complex Networks 3(2), 159–176 (2015). http://comnet.oxfordjournals.org/content/3/2/159

원 데이터를 지원하고 개발한 European Commission FET-Proactive PLEXMATH (Grant No. 317614)와 Alephsys Lab의 고지는 `data/SOURCE.md`에 원문 그대로 기록. 연결망의 구조와 한계를 살펴볼 때는 Varshney LR, Chen BL, Paniagua E, Hall DH, Chklovskii DB. Structural Properties of the *Caenorhabditis elegans* Neuronal Network. PLOS Computational Biology 7(2), e1001066 (2011)도 참고했다. 다만 동현파가 실제로 가져온 파일은 이 논문이 아니라 위 CoMuNeLab 저장소에서 왔다. https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1001066

라이선스가 따로 적혀 있지 않은 다른 미러의 연결 파일이나 WormAtlas 이미지는 가져오지 않았다.

## 촉각과 유전체, 동작에 관해 참고한 자료

- **고전 촉각 회로:** Chalfie M, Sulston JE, White JG, Southgate E, Thomson JN, Brenner S. The neural circuit for touch sensitivity in *Caenorhabditis elegans*. Journal of Neuroscience 5(4), 956–964 (1985). https://www.jneurosci.org/content/5/4/956
- **기계감각 리뷰:** Schafer WR. Mechanosensory molecules and circuits in *C. elegans*. Pflügers Archiv 467(1), 39–48 (2015; 온라인 출판 2014-07-23). 촉각 세포, 기계감각 통로, 앞뒤 반응, 강한 촉각의 구분을 참고했다. https://pmc.ncbi.nlm.nih.gov/articles/PMC4281349/
- **촉각의 시간적 부호화:** The *C. elegans* Touch Receptor Neurons Encode Temporal Features of Mechanical Stimuli. Scientific Reports (2019). 반복 입력을 어떻게 다룰지 참고했다. 앱의 적응 상수는 이 논문에서 잰 값이 아니다. https://www.nature.com/articles/s41598-019-41349-0
- **유전체 해독의 역사:** NHGRI, 1998: Genome of Roundworm *C. elegans* Sequenced. 유전체가 공개되었다는 사실과, 이 앱이 계산하는 신경 연결망은 서로 다른 이야기다. https://www.genome.gov/25520394/online-education-kit-1998-genome-of-roundworm-c-elegans-sequenced
- **기술 이름과 궤적:** Evolve MMA, 6 Unconventional Power Punches You Should Add To Your Boxing Arsenal. 오버핸드와 쇼벨 훅의 이름, 주먹이 지나가는 방향만 참고했다. 사진이나 영상, 문장은 가져오지 않았고 실제 복싱 교육용 동작 분석도 아니다. https://evolve-mma.com/blog/6-unconventional-power-punches-you-should-add-to-your-boxing-arsenal/

복싱 기술마다 선충의 실제 신경 반응이 확인된 것은 아니다. 동현파는 주먹이 닿은 것을 촉각 입력으로 바꾸고, 문헌을 바탕으로 제약을 둔 활성도 모델을 계산한 다음, 그 결과를 과장된 몸 연출과 이어 붙였다.

## 동현파가 손댄 부분

뉴런마다 0부터 시작하는 번호 부여. 원 자료가 방향 없는 연결이라고 밝힌 대로 각 층에서 순서만 다르거나 겹친 기록은 하나로 통합. 원본 기록 5,863개에서 층별 연결 3,108개로 정리. 뉴런 279개의 이름은 그대로.

원 자료에 없는 시냅스 방향이나 전달물질, 생리적 가중치를 되살렸다고 말하지는 않는다. 기능적 부호와 이득, 연속 활성도 방정식, 접촉 분포, 적응, 밀림·출렁임·구김은 동현파가 따로 정한 가정이며, `PROVENANCE.md`와 소스 코드에 모두 공개.

## 데이터의 ODbL·DbCL 조건

**Contains information from CoMuNeLab C.ELEGANS MULTIPLEX CONNECTOME, which is made available under the Open Database License (ODbL) 1.0.**

**동현파가 번호를 새로 매기고 중복을 정리한 DB도 ODbL 1.0으로 제공한다.** DB에 담긴 개별 내용에는 원 배포의 DbCL 1.0 안내를 그대로 따른다. [ODbL 전문](https://opendatacommons.org/licenses/odbl/1-0/) · [DbCL 전문](https://opendatacommons.org/licenses/dbcl/1-0/)

가공한 DB를 공개할 때는 출처와 라이선스 고지를 남기고 같은 ODbL 조건을 적용한다. 이 데이터로 만든 화면이나 완성 HTML을 공개할 때도 데이터 사용 고지와 데이터를 받을 수 있는 방법을 함께 남긴다. ODbL Section 4의 구체적인 의무와 예외는 원문에서 확인해 주길 바란다. 이 요약이 라이선스 원문을 대신하지는 않는다.

이 저장소에는 원본 데이터, 가공한 `connectome.json`, 변환 코드, 사용 고지가 모두 들어 있다. 단일 HTML에서도 ‘모델과 출처 → 모델 설명 → 가공 데이터 JSON 저장’을 누르면 기계가 읽을 수 있는 가공 DB를 내려받을 수 있다. 단일 HTML을 다시 배포한다면 이 고지와 다운로드 기능을 지우지 말아 주길 바란다.

## 코드·그림·글꼴

복싱 동작은 실제 인물이나 영상 프레임을 따라 그리지 않은, 동현파만의 픽셀 애니메이션이다. 짧은 잽과 길게 뻗는 스트레이트, 낮은 자세의 바디블로우, 올라오는 어퍼컷과 원을 그리는 동작의 차이를 만화처럼 강조했다. 바디 펀치에서 무릎을 낮추고 몸통을 돌리는 모습은 [Evolve의 설명](https://evolve-mma.com/blog/5-things-you-should-know-about-body-shots-in-boxing/)과 [ExpertBoxing의 펀치 동작 설명](https://expertboxing.com/how-to-punch-harder)을 참고했다. 팔이 길게 늘어나고 주먹이 커지고, 주먹이 몸에 잠시 머무는 것은 모두 연출이다. 사람의 실제 생체역학이나 실전 기술을 보여 주려는 것은 아니다.

- **동현파 코드와 그림:** MIT, Copyright (c) 2026 Kim Dong Hyun. 소녀와 선충, 효과는 모두 코드로 새로 그렸다. 양쪽으로 묶은 머리는 흔한 헤어스타일일 뿐, 특정 상업 캐릭터를 따라 그린 것이 아니다.
- **동현랭 v1.52 실행기:** MIT. 원 저작권과 전문은 `DONGHYUN-MIT.txt`에 있다.
- **문서 변환기:** Marked 15.0.12. 빌드할 때만 쓴다. MIT 및 관련 고지는 `MARKED-MIT.txt`에 있다.
- **글꼴:** Black Han Sans, Nanum Gothic Coding, Pretendard. SIL Open Font License 전문을 각 파일과 함께 넣었다.
- **접촉 효과음:** 코드가 직접 만들어 내는 짧은 소리다. 처음에는 꺼져 있고, 동현랭 명령 8로만 켤 수 있다.

MIT 코드와 ODbL 데이터는 서로 다른 권리 대상이다. 그래서 완성 HTML 전체를 아무 조건 없는 MIT라고 소개하지 않는다. 연구 논문은 근거로 인용했을 뿐, 논문의 그림이나 본문을 앱에 옮겨 오지 않았다.
