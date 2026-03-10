import {
  CLASS_INPUT,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
} from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

export function FilmPageEditTreatment({ form, setForm }: Props) {
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-treatment"
    >
      <label
        htmlFor="page-treatment"
        id="section-treatment"
        className={CLASS_SECTION_TITLE}
      >
        Treatment
      </label>
      <textarea
        id="page-treatment"
        rows={6}
        value={form.treatment ?? ''}
        onChange={(e) =>
          setForm((p) => ({ ...p, treatment: e.target.value }))
        }
        className={CLASS_INPUT}
      />
    </section>
  );
}
