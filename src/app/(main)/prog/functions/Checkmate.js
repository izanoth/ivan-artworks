import { isMoveValid } from './Moves.js';


//isMoveValid(fromSquare, toSquare, board, whiteTurn)

export function checkMate(board, whiteTurn) {
    const opponentColor = whiteTurn === true ? 'black' : 'white';

    const findKing = (board, color) => {
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < board[col].length; row++) {
                const theSquare = board[col][row];
                if (theSquare.piece && theSquare.piece.type === 'king' && theSquare.piece.color === color) {
                    return theSquare;
                }
            }
        }
        throw new Error('King not found on the board');
    };

    const isKingInCheck = (theKing, board, opponentColor) => {
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < board[col].length; row++) {
                const theSquare = board[col][row];
                const piece = theSquare?.piece;
                if (piece.type !== undefined && piece.color !== opponentColor) {

                    if (isMoveValid(theSquare, theKing, board, whiteTurn)) {
                        console.log('King is in check by ' + piece.type);
                        return true; // O rei está sendo atacado
                    }
                }
            }
        }
        console.log('King is not in Check');

        return false; // Rei não está em xeque
    };

    const canKingEscape = (theKing, board, opponentColor) => {
        const [col, row] = theKing.id.split('-').map(Number);
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Movimentos ortogonais
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Movimentos diagonais
        ];
        if (opponentColor == 'white') {
            var kingColor = 'black';
        }
        else {
            var kingColor = 'white';
        }
        for (const [dCol, dRow] of directions) {
            const newCol = col + dCol;
            const newRow = row + dRow;

            if (newCol == 6 && newRow == 1) {
                console.log('******************************************************');
            }
            /* console.log('whiteTurn: ', whiteTurn);
             console.log('opponentColor: ', opponentColor);
             console.log('kingColor: ', kingColor);

             console.log('BOL isMoveValid(theKing -> board[newCol][newRow]: ', isMoveValid(theKing, board[newCol][newRow], board, whiteTurn));
             console.log('BOL !(board[newCol][newRow]?.piece?.color === opponentColor): ', !(board[newCol][newRow]?.piece?.color === opponentColor));
             console.log('BOL still not in check?: ', !isKingInCheck(board[newCol][newRow], board, opponentColor))
             

            console.log('newCol, newRow: ', newCol + ', ' + newRow);
            console.log('isMainBoard?: ', (board[newCol][newRow]?.isMainBoard === true))
            console.log('BOL CONDITION: ', (isMoveValid(theKing, board[newCol][newRow], board, !whiteTurn) &&
                !(board[newCol][newRow]?.piece?.color === kingColor) &&
                !(board[newCol][newRow]?.isMainBoard === true) &&
                !isKingInCheck(board[newCol][newRow], board, opponentColor)));
              } */

            if (isMoveValid(theKing, board[newCol][newRow], board, !whiteTurn) &&
                !(board[newCol][newRow]?.piece?.color === kingColor) &&
                (board[newCol][newRow]?.isMainBoard === true) &&
                !isKingInCheck(board[newCol][newRow], board, opponentColor)) { //condição para verificar se o quadrado destino não contém o rei adversário
                console.log('King CAN escape!');
                return true; // Rei pode escapar para um quadrado seguro
            }
        }
        console.log('King CANNOT escape!');
        return false; // Rei não pode escapar
    };

    const canBlockOrCapture = (theKing, board, opponentColor) => {
        const attackingPieces = [];

        // Encontrar todas as peças atacantes
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < board[col].length; row++) {
                const piece = board[col][row]?.piece;
                if (piece != {} && piece.color !== opponentColor) {
                    if (isMoveValid(board[col][row], theKing, board, whiteTurn)) {
                        attackingPieces.push(board[col][row]);
                    }

                }
            }
        }
        console.log('Found Attacking Pieces (array): ', attackingPieces);

        // Verificar se é possível capturar as peças atacantes ou bloquear o ataque
        for (const attacker of attackingPieces) {
            for (let col = 0; col < board.length; col++) {
                for (let row = 0; row < board[col].length; row++) {
                    const piece = board[col][row]?.piece;
                    if (piece.type !== undefined && piece.color === opponentColor) {
                        console.log('opponentColor: ', opponentColor);
                        var [attackerCol, attackerRow] = attacker.id.split('-').map(Number);
                        var temp_updatedBoard = board.map(row => row.map(square => ({ ...square })));
                        temp_updatedBoard[attackerCol][attackerRow].piece = piece;
                        
                        if (isMoveValid(board[col][row], attacker, board, !whiteTurn) &&
                            !isKingInCheck(theKing, temp_updatedBoard, opponentColor) &&
                            (piece.color === opponentColor && piece.type !== 'king')) {
                                console.log('attacker: ', attacker);
                                console.log('piece: ', piece);
                            console.log('CAN Block or Capture');

                            return true; // Uma peça pode capturar o atacante
                        }

                    }
                }
            }
        }
        console.log('CANNOT Block or Capture');
        return false; // Nenhuma peça pode intervir
    };

    // 1. Encontrar a posição do rei
    const theKing = findKing(board, opponentColor); // OK

    // 2. Verificar se o rei está em xeque
    if (!isKingInCheck(theKing, board, opponentColor)) { // OK
        return false; // Não há xeque, logo não há xeque-mate
    }
    else {
        alert('King is in check!');
    }

    // 3. Testar todos os movimentos do rei para sair do xeque
    if (canKingEscape(theKing, board, opponentColor)) { //OK
        return false; // Rei pode escapar
    }
    else {
        alert('King cannot escape!');
    }

    // 4. Verificar se outra peça pode bloquear o xeque ou capturar a peça atacante
    if (canBlockOrCapture(theKing, board, opponentColor)) { //OK
        return false; // Xeque pode ser bloqueado ou a peça atacante capturada
    }
    else {
        alert('Checkmate!');
    }

    return true; // Xeque-mate confirmado
};