export function isMoveValid(fromSquare, toSquare, board, whiteTurn=undefined) {

  const [fromCol, fromRow] = fromSquare.id.split('-').map(Number);
  const [toCol, toRow] = toSquare.id.split('-').map(Number);
  const piece = fromSquare.piece;

  if (whiteTurn && toSquare.piece.color == 'white') {
    return false;
  }
  if (!whiteTurn && toSquare.piece.color == 'black') {
    return false;
  }

  const forWizard = (fromSquare, toSquare, board) => {
    const [fromCol, fromRow] = fromSquare.id.split('-').map(Number);
    const [toCol, toRow] = toSquare.id.split('-').map(Number);

    const rowDiff = Math.abs(toCol - fromCol);
    const colDiff = Math.abs(toRow - fromRow);

    // Movimento de um quadrado na diagonal
    if (rowDiff === 1 && colDiff === 1) {
      return true;
    }

    // Movimento exagerado do cavalo (3 quadrados horizontal/vertical + 1 lado)
    if ((rowDiff === 3 && colDiff === 1) || (rowDiff === 1 && colDiff === 3)) {
      return true;
    }

    return false;
  };

  const forChampion = (fromSquare, toSquare, board) => {
    const [fromCol, fromRow] = fromSquare.id.split('-').map(Number);
    const [toCol, toRow] = toSquare.id.split('-').map(Number);

    const rowDiff = Math.abs(toCol - fromCol);
    const colDiff = Math.abs(toRow - fromRow);

    // Movimento ortogonal de um quadrado
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return true;
    }

    // Movimento de dois quadrados ortogonalmente ou diagonalmente
    if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2) || (rowDiff === 2 && colDiff === 2)) {
      return true;
    }

    // Caso não atenda nenhuma regra acima
    return false;
  };

  const forRook = (fromCol, fromRow, toCol, toRow, board) => {
    if (fromCol !== toCol && fromRow !== toRow) {
      return false; // A torre só pode se mover em linha reta
    }

    // Verificar se o caminho está livre (não pode haver peças no caminho)
    if (fromCol === toCol) {
      const step = fromRow < toRow ? 1 : -1;
      for (let row = fromRow + step; (step > 0 ? row < toRow : row > toRow); row += step) {
        if (board[fromCol][row].piece.type != undefined) {
          return false; // Se houver uma peça no caminho, movimento inválido
        }
        else {
          continue;
        }
      }
      return true;
    } else {
      const step = fromCol < toCol ? 1 : -1;
      for (let col = fromCol + step; (step > 0 ? col < toCol : col > toCol); col += step) {
        if (board[col][fromRow].piece.type != undefined) {
          return false; // Se houver uma peça no caminho, movimento inválido
        }
        else {
          continue;
        }
      }
      return true;
    }
  };

  const forKnight = (fromCol, fromRow, toCol, toRow, board) => {
    const rowDiff = Math.abs(toCol - fromCol);
    const colDiff = Math.abs(toRow - fromRow);

    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
      return true;
    }
    return false;
  };

  const forBishop = (fromCol, fromRow, toCol, toRow, board) => {

    if (Math.abs(fromCol - toCol) !== Math.abs(fromRow - toRow)) {
      return false; // O bispo só pode se mover diagonalmente
    }

    // Verificar se o caminho está livre (não pode haver peças no caminho)
    const rowStep = fromCol < toCol ? 1 : -1;
    const colStep = fromRow < toRow ? 1 : -1;
    let row = fromCol + rowStep;
    let col = fromRow + colStep;
    while (row !== toCol && col !== toRow) {
      if (board[row][col].piece.type != undefined) {
        return false; // Se houver uma peça no caminho, movimento inválido
      }
      row += rowStep;
      col += colStep;
    }
    return true;
  };

  const forPawn = (fromSquare, toSquare, color, board) => {
    const [fromCol, fromRow] = fromSquare.id.split('-').map(Number);
    const [toCol, toRow] = toSquare.id.split('-').map(Number);
    const direction = color === 'white' ? -1 : 1; // Direção do peão depende da cor

    // Movimento normal de uma casa
    if (fromCol === toCol && toRow === fromRow + direction && (board[toCol][toRow].piece.type == undefined)) {

      return true;

    }

    var initRow;
    direction == 1 ?
      initRow = 2 :
      initRow = 9

    // Movimento inicial de duas casas
    if (fromCol === toCol && fromRow === initRow && (toRow === fromRow + 2 * direction || toRow === fromRow + 3 * direction) && board[toCol][toRow].piece.type == undefined) {
      return true;
    }
    // Captura
    if ((fromRow - toRow) == -(direction) && (toCol === fromCol + 1 || toCol === fromCol + -1) && board[toCol][toRow].piece.type != undefined) {
      return true;
    }
    return false;
  };

  // Validação de movimentos de acordo com o tipo de peça
  switch (piece?.type) {
    case 'king':
      return (
        Math.abs(fromCol - toCol) <= 1 && Math.abs(fromRow - toRow) <= 1
      );
    case 'queen':
      return forRook(fromCol, fromRow, toCol, toRow, board) ||
        forBishop(fromCol, fromRow, toCol, toRow, board);
    case 'bishop':
      return forBishop(fromCol, fromRow, toCol, toRow, board);
    case 'knight':
      return forKnight(fromCol, fromRow, toCol, toRow, board);
    case 'rook':
      return forRook(fromCol, fromRow, toCol, toRow, board);
    case 'pawn':
      return forPawn(fromSquare, toSquare, piece.color, board);
    case 'wizard':
      return forWizard(fromSquare, toSquare);
    case 'champion':
      return forChampion(fromSquare, toSquare);
    default:
      return false;
  }
};