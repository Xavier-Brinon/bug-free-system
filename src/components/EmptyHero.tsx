type EmptyHeroProps = {
  onStartAdding: () => void;
};

export function EmptyHero({ onStartAdding }: EmptyHeroProps) {
  return (
    <section className="empty-hero">
      <h2>Nothing on the nightstand</h2>
      <p>Pick your next read and start tracking it here.</p>
      <button type="button" onClick={onStartAdding}>
        Add a Book
      </button>
    </section>
  );
}
