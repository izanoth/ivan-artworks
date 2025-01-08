export function Square({ square, onClick, isSelected }) {
  const { isMainBoard, isWizardTile, piece, id, isWhite } = square;
  const squareClass = isWizardTile
    ? ''
    : isMainBoard
      ? ''
      : 'outside-square';

  const colorClass = !(isMainBoard || isWizardTile) ? '' : isWhite ? 'backg-white' : 'backg-black';

  return (
    <div
      className={`${colorClass} square ${squareClass} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {piece && <Piece imgid={id} type={piece.type} color={piece.color} />}
    </div>
  );
};

const Piece = ({ imgid, type, color }) => {
  if (type != null) {
    return <div className={`piece ${type} ${color}`}>
      <img
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        id={`icon${imgid}`}
        src={`/pieces/${color}-${type}.svg`}
        alt={`${color} ${type}`}
      />
    </div>;
  }
};