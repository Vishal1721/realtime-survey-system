import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 100, // virtual users
  duration: "10s", // test duration
};

export default function () {
  const payload = JSON.stringify({
    pollId: "1",
    option: "A",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post('http://host.docker.internal:8080/api/submit', payload, params);

 check(res, {
   "status is 200": (r) => r.status === 200,
   "status is 429": (r) => r.status === 429,
 });

  sleep(0.1);
}
