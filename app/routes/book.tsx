import { useSearchParams } from "@remix-run/react";

export default function Submit() {
  const [params] = useSearchParams();
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  return (
    <div>
      submit: {start} – {end}
    </div>
  );
}
