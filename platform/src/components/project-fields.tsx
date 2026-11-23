import type { Dict } from "@/lib/i18n/dict";
import type { ProjectRow } from "@/lib/server/repo";
import { Field, inputCls } from "./ui";

export function ProjectFields({ t, p }: { t: Dict; p?: ProjectRow }) {
  const T = t.project;
  return (
    <>
      <Field label={T.name} htmlFor="name">
        <input id="name" name="name" required minLength={2} maxLength={120} defaultValue={p?.name} className={inputCls} />
      </Field>
      <Field label={T.description} htmlFor="description">
        <textarea id="description" name="description" maxLength={1000} rows={3} defaultValue={p?.description} className={inputCls} />
      </Field>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label={T.country} htmlFor="country">
          <input id="country" name="country" required maxLength={80} defaultValue={p?.country} className={inputCls} />
        </Field>
        <Field label={T.area} htmlFor="area" hint={T.areaHint}>
          <input id="area" name="area" required maxLength={120} defaultValue={p?.area} className={inputCls} />
        </Field>
      </div>
      <fieldset className="mb-4">
        <legend className="mb-1 text-sm font-semibold">{T.model}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["workers", "service_users", "both", "undetermined"] as const).map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="beneficiaryModel" value={m} required defaultChecked={(p?.beneficiary_model ?? "undetermined") === m} />
              <span className="text-sm">{T.models[m]}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">{T.modelHint}</p>
      </fieldset>
      <label className="mb-1 flex items-start gap-2 text-sm">
        <input type="checkbox" name="grantsCoverCosts" defaultChecked={!!p?.grants_cover_costs} className="mt-1" />
        <span className="font-semibold">{T.grants}</span>
      </label>
      <p className="mb-6 text-xs text-muted">{T.grantsHint}</p>
    </>
  );
}
