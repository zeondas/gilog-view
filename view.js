// 지시부 보기 화면(민원처리 ✔62, 2026-11-25 사용자 ①2안 ②2안).
// - 이 화면은 자료를 갖지 않아요. 주소 끝(# 뒤 – 서버로 가지 않는 자리)에 실려 온 카카오 그림 주소만 띄워요.
// - 카카오 그림 주소가 아니면 띄우지 않아요(남이 이 화면에 다른 그림을 끼워 보이지 못하게).

const HOSTS = [".kakaocdn.net", ".kakao.com"];

/** 주소 끝(#p=…) 또는 물음표 뒤(?p=…)에서 그림 주소를 꺼내 확인해요. 카카오 그림 주소가 아니면 "" */
export function pictureUrl(hash, search) {
  const raw = new URLSearchParams(String(hash || "").replace(/^#/, "")).get("p") || new URLSearchParams(String(search || "")).get("p") || "";
  if (!raw) return "";
  let u;
  try {
    u = new URL(raw);
  } catch {
    return "";
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return "";
  if (u.username || u.password || u.port) return "";
  const host = u.hostname.toLowerCase();
  if (!HOSTS.some((h) => host.endsWith(h))) return "";
  u.protocol = "https:";
  return u.href;
}

function start() {
  const pic = document.getElementById("pic");
  const msg = document.getElementById("msg");
  const bar = document.getElementById("bar");
  const save = document.getElementById("save");
  const hint = document.getElementById("hint");
  if (!pic || !msg || !bar || !save || !hint) return;
  const url = pictureUrl(location.hash, location.search);
  if (!url) {
    msg.textContent = "지시부 그림을 찾지 못했어요. 보낸 사람에게 다시 보내 달라고 해 주세요.";
    return;
  }
  pic.onload = () => {
    msg.hidden = true;
    pic.hidden = false;
    bar.hidden = false;
  };
  pic.onerror = () => {
    msg.textContent = "그림을 불러오지 못했어요. 보낸 지 100일이 지났으면 그림이 지워졌을 수 있어요.";
  };
  pic.src = url;
  save.onclick = async () => {
    save.disabled = true;
    try {
      const res = await fetch(url, { referrerPolicy: "no-referrer" });
      if (!res.ok) throw new Error(String(res.status));
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = "지시부.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10000);
      hint.textContent = "저장했어요. 안 보이면 그림을 길게 눌러 저장해 주세요.";
    } catch {
      hint.textContent = "그림을 길게 눌러 [이미지 저장]을 골라 주세요.";
    }
    save.disabled = false;
  };
}

if (typeof document !== "undefined") start();
