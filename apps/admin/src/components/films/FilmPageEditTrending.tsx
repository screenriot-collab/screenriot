import { CLASS_INPUT, CLASS_LABEL } from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

export function FilmPageEditTrending({ form, setForm }: Props) {
  return (
    <div className="mt-6">
      <label htmlFor="page-trending" className={CLASS_LABEL}>
        Trending text
      </label>
      <input
        id="page-trending"
        type="text"
        value={form.trendingText ?? ''}
        onChange={(e) =>
          setForm((p) => ({ ...p, trendingText: e.target.value }))
        }
        placeholder="e.g. Top 10% this week"
        className={CLASS_INPUT}
      />
    </div>
  );
}
