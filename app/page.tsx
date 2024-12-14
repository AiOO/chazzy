export default function Home() {
  return (
    <main style={{ color: 'black', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <h1>Chazzy</h1>
      <p>
        스트리머의 치지직, 트위치, 숲(구 아프리카TV) ID를 조합하여 다음과 같은 주소를 만들어 웹 브라우저로 접속합니다.
        <br />
        각각의 ID는 생략할 수 있으며, 생략한 경우 해당 플랫폼의 채팅 및 기능은 노출되지 않습니다.
      </p>
      <p>
        https://chazzy.vercel.app/{'{치지직 ID}'}-{'{트위치 ID}'}-{'{숲 ID}'}
      </p>
      <h2>사용 방법 상세 안내</h2>
      <p>(예시 주소는 각각 치지직, 트위치, 숲의 공식 계정입니다.)</p>
      <p>
        만약 스트리머의 치지직 주소가 다음과 같고:
        <br />
        https://chzzk.naver.com/c42cd75ec4855a9edf204a407c3c1dd2
      </p>
      <p>
        스트리머의 트위치 주소가 다음과 같고:
        <br />
        https://www.twitch.tv/twitch
      </p>
      <p>
        스트리머의 숲 주소가 다음과 같다면:
        <br />
        https://ch.sooplive.co.kr/afreecapd
      </p>
      <p>
        → Chazzy 주소는 다음과 같습니다:
        <br />
        https://chazzy.vercel.app/c42cd75ec4855a9edf204a407c3c1dd2-twitch-afreecapd
      </p>
      <h3>원하는 플랫폼만 사용하기</h3>
      <p>
        일부 플랫폼만 사용하시는 경우 사용하지 않는 플랫폼 ID를 생략할 수 있습니다. 다만 플랫폼 ID 구분을 위한 -는
        여전히 남아있는 것에 유의해주세요.
      </p>
      <p>
        → 치지직과 트위치만 사용 시 Chazzy 주소:
        <br />
        https://chazzy.vercel.app/c42cd75ec4855a9edf204a407c3c1dd2-twitch-
      </p>
      <p>
        → 트위치와 숲만 사용 시 Chazzy 주소:
        <br />
        https://chazzy.vercel.app/-twitch-afreecapd
      </p>
      <p>
        → 치지직만 사용 시 Chazzy 주소:
        <br />
        https://chazzy.vercel.app/c42cd75ec4855a9edf204a407c3c1dd2--
      </p>
      <hr />
      <p>
        Chazzy와 관련한 자세한 내용은 다음 링크를 참고하세요.
        <br />
        <a href="https://blog.aioo.ooo/chazzy/">https://blog.aioo.ooo/chazzy/</a>
      </p>
    </main>
  );
}
