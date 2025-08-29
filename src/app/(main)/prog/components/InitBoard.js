export function initialBoard() {
    const board = [];
    for (let column = 0; column < 12; column++) {
      const currentRow = [];
      for (let row = 0; row < 12; row++) {
        /*       const isMainBoard = row >= 1 && row <= 10 && col >= 1 && col <= 10;*/
        const isWhite = (column + row) % 2 === 1;
        if ((column === 0 || column === 11) && (row === 0 || row === 11)) {
          if ((row == 11 && column == 11) || (row == 11 && column == 0)) {
            currentRow.push({
              id: `${column}-${row}`,
              piece: { type: 'wizard', color: 'white' },
              isMainBoard: false,
              isWizardTile: true,
              isWhite: isWhite,
            });
          }
          else if ((column == 0 && row == 0) || (column == 11 && row == 0)) {
            currentRow.push({
              id: `${column}-${row}`,
              piece: { type: 'wizard', color: 'black' },
              isMainBoard: false,
              isWizardTile: true,
              isWhite: isWhite,
            });
          }
        }
        else if (((column === 0 || column === 11) && (row !== 0 || row !== 11)) || ((column !== 0 || column !== 11) && (row === 0 || row === 11))) {
          currentRow.push({
            id: `${column}-${row}`,
            piece: {},
            isMainBoard: false,
            isWizardTile: false,
            isWhite: isWhite,
          });
        }
        else {
          currentRow.push({
            id: `${column}-${row}`,
            piece: {},
            isMainBoard: true,
            isWizardTile: false,
            isWhite: isWhite,
          });
        }
      }
      board.push(currentRow);
    }
  
    // Rei branco e preto
    board[6][1].piece = { type: 'king', color: 'black' };
    board[5][10].piece = { type: 'king', color: 'white' };
  
    // Rainha branca e preta
    board[5][1].piece = { type: 'queen', color: 'black' };
    board[6][10].piece = { type: 'queen', color: 'white' };
  
    // Bispo branco e preto
    board[4][1].piece = { type: 'bishop', color: 'black' };
    board[4][10].piece = { type: 'bishop', color: 'white' };
    board[7][1].piece = { type: 'bishop', color: 'black' };
    board[7][10].piece = { type: 'bishop', color: 'white' };
  
    // Cavalo branco e preto
    board[3][1].piece = { type: 'knight', color: 'black' };
    board[3][10].piece = { type: 'knight', color: 'white' };
    board[8][1].piece = { type: 'knight', color: 'black' };
    board[8][10].piece = { type: 'knight', color: 'white' };
  
    // Torre branca e preta
    board[2][1].piece = { type: 'rook', color: 'black' };
    board[2][10].piece = { type: 'rook', color: 'white' };
    board[9][1].piece = { type: 'rook', color: 'black' };
    board[9][10].piece = { type: 'rook', color: 'white' };
  
    // Campeão branco e preto
    board[1][1].piece = { type: 'champion', color: 'black' };
    board[1][10].piece = { type: 'champion', color: 'white' };
    board[10][1].piece = { type: 'champion', color: 'black' };
    board[10][10].piece = { type: 'champion', color: 'white' };
  
    // Colocando os peões
    for (let row = 1; row <= 10; row++) {
      board[row][2].piece = { type: 'pawn', color: 'black' };  // Peões brancos na coluna 2
      board[row][9].piece = { type: 'pawn', color: 'white' }; // Peões pretos na coluna 9
    }
    return board;
  };