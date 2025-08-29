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

{/* <div className="w-full lg:w-1/3">
  <h1 className="text-2xl font-bold">Omega Chess</h1>
  <div className="card p-2 mt-2 text-left"></div> */}

const Piece = ({ imgid, type, color }) => {
  if (type != null) {
    return <div className={`piece ${type} ${color}`}>
      <div className="svg-piece">
        <img
          id={`icon${imgid}`}
          src={`/pieces/${color}-${type}.svg`}
          alt={`${color} ${type}`}
        />
      </div>
    </div>;
  }
};