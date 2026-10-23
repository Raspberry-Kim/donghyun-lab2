# 동현파™: 전체 출처·가공 내역·이용 안내

동현파는 공개 선충 연결망과 촉각 연구를 이용한 독립 교육용 프로젝트다. CoMuNeLab·원 연구진·WormAtlas·OpenWorm·유전체 연구기관의 공식 제품이나 인증·후원 프로젝트가 아니다.

## 공개 연결 데이터

**CoMuNeLab, C.ELEGANS MULTIPLEX CONNECTOME**. 원 데이터는 뉴런 279개와 전기적 접합·화학적 monadic 접합·화학적 polyadic 접합의 세 층을 제공한다. 고정 커밋은 `9d6d48af4eb6acef31ad9999e22fbd27c2ce210b`다.

원문·파일·라이선스: https://github.com/CoMuNeLab/C-elegans-Multiplex-Connectome

원 저장소가 인용하는 연구:

- **연결망 원 연구:** Chen BL, Hall DH, Chklovskii DB. Wiring optimization can relate neuronal structure and function. PNAS 103(12), 4723–4728 (2006). 원 데이터 저장소가 지정한 인용 문헌이다. http://www.pnas.org/content/103/12/4723.abstract
- **다층 네트워크 도구:** De Domenico M, Porter MA, Arenas A. MuxViz: A Tool for Multilayer Analysis and Visualization of Networks. Journal of Complex Networks 3(2), 159–176 (2015). 원 데이터 저장소가 지정한 인용 문헌이다. http://comnet.oxfordjournals.org/content/3/2/159

원 데이터의 연구 지원·개발 고지인 European Commission FET-Proactive PLEXMATH (Grant No. 317614) 및 Alephsys Lab의 기여도 `data/SOURCE.md`에 원문 그대로 보존했다. 추가로 연결망의 구조와 한계를 검토하는 데 Varshney LR, Chen BL, Paniagua E, Hall DH, Chklovskii DB. Structural Properties of the Caenorhabditis elegans Neuronal Network. PLOS Computational Biology 7(2), e1001066 (2011)을 참고했다. 이 문헌을 이번 입력 파일의 직접 배포 출처와 혼동하지 않는다. https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1001066

이번 앱의 배포 입력은 위 CoMuNeLab 저장소의 ODbL/DbCL 자료다. 별도의 라이선스가 없는 다른 미러의 연결 파일이나 WormAtlas 이미지를 가져와 동일 조건이라고 가정하지 않았다.

## 촉각·유전체·동작에 관한 근거

- **고전 촉각 회로:** Chalfie M, Sulston JE, White JG, Southgate E, Thomson JN, Brenner S. The neural circuit for touch sensitivity in Caenorhabditis elegans. Journal of Neuroscience 5(4), 956–964 (1985). https://www.jneurosci.org/content/5/4/956
- **기계감각 리뷰:** Schafer WR. Mechanosensory molecules and circuits in C. elegans. Pflügers Archiv 467(1), 39–48 (2015; 온라인 출판 2014-07-23). 촉각 세포·기계감각 통로·전후 반응·강한 촉각의 구분을 참고했다. https://pmc.ncbi.nlm.nih.gov/articles/PMC4281349/
- **촉각의 시간적 부호화:** The C. elegans Touch Receptor Neurons Encode Temporal Features of Mechanical Stimuli. Scientific Reports (2019). 반복 입력의 시간적 해석에 참고했으며 앱의 적응 상수를 이 논문의 측정값이라고 주장하지 않는다. https://www.nature.com/articles/s41598-019-41349-0
- **유전체 해독의 역사:** NHGRI, 1998: Genome of Roundworm C. elegans Sequenced. 유전체 공개와 이 앱의 신경 연결망 계산은 구별한다. https://www.genome.gov/25520394/online-education-kit-1998-genome-of-roundworm-c-elegans-sequenced
- **기술 이름과 궤적:** Evolve MMA, 6 Unconventional Power Punches You Should Add To Your Boxing Arsenal. 오버핸드·쇼벨 훅의 명칭과 시각적 방향에만 참고했다. 사진·영상·문장을 복제하지 않았고 실제 복싱 교육용 동작 분석이 아니다. https://evolve-mma.com/blog/6-unconventional-power-punches-you-should-add-to-your-boxing-arsenal/

복싱 기술별로 선충의 실제 신경 반응이 검증되었다는 주장은 하지 않는다. 기계적 접촉을 촉각 입력으로 변환한 뒤 문헌 제약을 가진 활성도 모델을 계산하고, 그 출력과 과장된 몸체 연출을 연결한다.

## 가공한 내용

뉴런 ID를 0부터 시작하는 인덱스로 재색인하고, 원 자료의 무방향 선언에 따라 각 층에서 역순·중복 기록을 통합했다. 5,863개 원 기록은 3,108개의 층별 연결이 되었고, 뉴런 279개의 이름은 그대로 남겼다.

원 자료에 없는 시냅스 방향·전달물질·생리적 가중치를 복원했다고 표시하지 않는다. 기능적 부호·이득, 연속 활성도 방정식, 접촉 분포, 적응, 밀림·출렁임·구김은 별도 가정이며 `PROVENANCE.md`와 소스 코드에 공개했다.

## 데이터의 ODbL·DbCL 조건

**Contains information from CoMuNeLab C.ELEGANS MULTIPLEX CONNECTOME, which is made available under the Open Database License (ODbL) 1.0.**

**동현파의 재색인·중복 제거 DB도 ODbL 1.0으로 제공한다.** 데이터베이스의 개별 내용에 대해서는 원 배포의 DbCL 1.0 안내를 보존한다. [ODbL 전문](https://opendatacommons.org/licenses/odbl/1-0/) · [DbCL 전문](https://opendatacommons.org/licenses/dbcl/1-0/)

공개된 가공 DB에는 출처·라이선스 고지를 유지하고 동일한 ODbL 조건을 적용한다. 데이터로 만든 화면·완성 HTML 같은 결과물을 공개할 때에도 데이터 사용 고지와 접근 수단을 보존한다. ODbL Section 4의 구체적 의무와 예외는 원문을 확인해야 하며, 이 요약이 라이선스 원문을 대체하지 않는다.

이 배포는 원본 데이터, 가공 `connectome.json`, 변환 코드, 사용 고지를 모두 포함한다. 단일 HTML에서도 ‘모델과 출처 → 모델 설명 → 가공 데이터 JSON 저장’으로 기계 판독 가능한 가공 DB를 내려받을 수 있다. 단일 HTML을 배포할 때 이 고지나 다운로드 기능을 제거하지 않는 것이 중요하다.

## 코드·그림·글꼴

복싱 동작은 실제 인물이나 영상 프레임을 복제하지 않은 자체 픽셀 애니메이션이다. 짧은 잽·긴 직선 스트레이트, 낮은 자세의 바디블로우, 위로 올라오는 어퍼컷과 원호 동작의 차이를 만화적으로 강조했다. 바디 펀치의 무릎 낮춤·몸통 회전 구분에는 [Evolve의 설명](https://evolve-mma.com/blog/5-things-you-should-know-about-body-shots-in-boxing/)과 [ExpertBoxing의 펀치 동작 설명](https://expertboxing.com/how-to-punch-harder)을 참고했다. 팔의 비정상적인 길이·주먹 확대·주먹이 몸에 남는 표현은 연출이며, 사람의 정확한 생체역학이나 실전 교육을 재현하지 않는다.

- **동현파 코드와 원본 그림:** MIT, Copyright (c) 2026 Kim Dong Hyun. 어린이 캐릭터와 선충·효과는 코드로 새로 그렸다. 양쪽 똥머리는 헤어스타일이며 특정 상업 캐릭터의 이미지를 복제하지 않았다.
- **동현랭 v1.5 실행기:** MIT, 원 저작권과 전문을 `DONGHYUN-MIT.txt`에 보존했다.
- **문서 변환기:** Marked 15.0.12, MIT 및 관련 고지를 `MARKED-MIT.txt`에 보존했다. 빌드할 때만 사용한다.
- **글꼴:** Black Han Sans, Nanum Gothic Coding, Pretendard. SIL Open Font License 전문을 각 파일과 함께 보존했다.
- **접촉 효과음:** 코드가 합성하는 짧은 음이다. 기본은 꺼져 있으며 동현랭 명령 8로만 켠다.

MIT 코드와 ODbL 데이터는 서로 다른 권리 대상이다. 완성 HTML 전체가 아무 조건 없는 MIT 데이터라고 표시해서는 안 된다. 연구 논문은 근거로 인용했을 뿐 그 도판이나 본문 전체를 앱에 복제하지 않았다.
