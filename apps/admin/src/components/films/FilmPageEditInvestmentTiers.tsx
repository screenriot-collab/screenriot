import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_CARD,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import type { FilmPageFormState, InvestmentTierForm } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

function newTier(index: number): InvestmentTierForm {
  return {
    id: `tier-${Date.now()}-${index}`,
    amount: 0,
    name: '',
    benefits: [],
  };
}

export function FilmPageEditInvestmentTiers({ form, setForm }: Props) {
  const tiers = form.sidebarTiers ?? [];

  const addTier = () => {
    setForm((p) => ({
      ...p,
      sidebarTiers: [...(p.sidebarTiers ?? []), newTier((p.sidebarTiers ?? []).length)],
    }));
  };

  const removeTier = (id: string) => {
    setForm((p) => ({
      ...p,
      sidebarTiers: (p.sidebarTiers ?? []).filter((t) => t.id !== id),
    }));
  };

  const updateTier = (
    id: string,
    patch: Partial<Pick<InvestmentTierForm, 'amount' | 'name' | 'benefits'>>,
  ) => {
    setForm((p) => ({
      ...p,
      sidebarTiers: (p.sidebarTiers ?? []).map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    }));
  };

  const setBenefitsFromText = (id: string, text: string) => {
    const benefits = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    updateTier(id, { benefits });
  };

  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-investment-tiers"
    >
      <h2 id="section-investment-tiers" className={CLASS_SECTION_TITLE}>
        Investment Tiers (Sidebar)
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Donation tiers shown on the film detail page sidebar. Amount (USD), name
        and benefits list. Used for Stripe checkout options.
      </p>

      <ul className="mt-4 space-y-4" role="list">
        {tiers.map((tier) => (
          <li key={tier.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                Tier: {tier.name || tier.id}
              </span>
              <button
                type="button"
                onClick={() => removeTier(tier.id)}
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove tier ${tier.name || tier.id}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`tier-amount-${tier.id}`}
                  className="mb-1 block text-xs text-gray-400"
                >
                  Amount (USD)
                </label>
                <input
                  id={`tier-amount-${tier.id}`}
                  type="number"
                  min={0}
                  step={1}
                  value={tier.amount}
                  onChange={(e) =>
                    updateTier(tier.id, {
                      amount: Number(e.target.value) || 0,
                    })
                  }
                  className={CLASS_INPUT_SM}
                  aria-label="Tier amount in USD"
                />
              </div>
              <div>
                <label
                  htmlFor={`tier-name-${tier.id}`}
                  className="mb-1 block text-xs text-gray-400"
                >
                  Name
                </label>
                <input
                  id={`tier-name-${tier.id}`}
                  type="text"
                  value={tier.name}
                  onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Film Fan"
                  aria-label="Tier name"
                />
              </div>
            </div>
            <div className="mt-3">
              <label
                htmlFor={`tier-benefits-${tier.id}`}
                className="mb-1 block text-xs text-gray-400"
              >
                Benefits (one per line)
              </label>
              <textarea
                id={`tier-benefits-${tier.id}`}
                rows={3}
                value={(tier.benefits ?? []).join('\n')}
                onChange={(e) =>
                  setBenefitsFromText(tier.id, e.target.value)
                }
                className={CLASS_INPUT_SM}
                placeholder="Digital copy of the film&#10;Name in credits"
                aria-label="Tier benefits, one per line"
              />
            </div>
            {typeof tier.investorsCount === 'number' && (
              <p className="mt-2 text-xs text-gray-500" aria-live="polite">
                Investors (read-only): {tier.investorsCount}
              </p>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addTier}
        className={CLASS_ADD_LINK}
        aria-label="Add investment tier"
      >
        + Add tier
      </button>
    </section>
  );
}
