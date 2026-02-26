type QueueCountProps = {
  count: number;
};

export function QueueCount({ count }: QueueCountProps) {
  const label = count === 1 ? "book" : "books";
  return (
    <div className="queue-count">
      <span className="queue-count-number">{count}</span> {label} to read
    </div>
  );
}
