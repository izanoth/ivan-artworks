// Omega Chess Frontend

import React, { useState } from 'react';
import { initialBoard } from './components/InitBoard.js';
import { Square } from './components/Square.js'
import { isMoveValid } from './functions/Moves.js';
import { checkMate } from './functions/Checkmate.js';
import './style/App.css';

const OmegaChess = () => {
  const [whiteTurn, changeTurn] = useState(true);
  const [board, setBoardState] = useState(initialBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);


  const handleSquareClick = (square, currColor) => {

    // SE A PEÇA JÁ TA SELECIONADA
    if (selectedPiece) { // entao...
      const [fromCol, fromRow] = selectedPiece.id.split('-').map(Number);
      const fromPiece = board[fromCol][fromRow]?.piece;
      const [toCol, toRow] = square.id.split('-').map(Number);

      if (Object.keys(square.piece).length !== 0) { // se o quadrado NÃO É vazio
        console.log(('is move valid?: ', isMoveValid(selectedPiece, square, board, whiteTurn)));
        console.log('piece color: ', square.piece.color);
        console.log('current color: ', currColor);
        if (square === selectedPiece) { //Se o quadrado for a mesma peça, desfazer a seleção
          setSelectedPiece(null);
        }
        else if (selectedPiece.piece.color === currColor) {// Se o quadrado contiver uma peça da mesma cor..
          setSelectedPiece(null);
          setSelectedPiece(square);// reselecionar.
        }
        else if (isMoveValid(selectedPiece, square, board, whiteTurn)) {  // já se se o movimento é valido...
          setSelectedPiece(null); // Reseta a seleção
          movePiece(selectedPiece, square); // ocupar o espaço
        }
        else {
          // Movimento inválido
          alert('Movimento inválido!'); // Exibe feedback ao jogador
          setSelectedPiece(null); // Reseta a seleção
        }
      }
      else {  // se o quadrado NÃO É uma peça adversária
        if (isMoveValid(selectedPiece, square, board, whiteTurn)) {
          setSelectedPiece(null); // Reseta a seleção
          // e se o movimento é valido...
          movePiece(selectedPiece, square); // ocupar o espaço
        }
        else {
          // Movimento inválido
          alert('Movimento inválido!'); // Exibe feedback ao jogador
          setSelectedPiece(null); // Reseta a seleção
        }
      }
    }
    // SE A PEÇA NAO TA SELECIONADA
    else {
      if (!isSelectionValid(square)) {
        return; // Se a seleção não for válida, não faz nada
      }
      else {
        // se selecionou a peça certa, então...
        setSelectedPiece(square);
      }
    }
  };

  const movePiece = (fromSquare, toSquare) => {
    const [fromCol, fromRow] = fromSquare.id.split('-').map(Number);
    const [toCol, toRow] = toSquare.id.split('-').map(Number);
    const updatedBoard = board.map(row => row.map(square => ({ ...square })));
    updatedBoard[toCol][toRow].piece = updatedBoard[fromCol][fromRow].piece;
    updatedBoard[fromCol][fromRow].piece = {};
    document.getElementById('icon' + fromSquare.id).remove();
    changeTurn(!whiteTurn);
    setBoardState(updatedBoard);
    checkMate(updatedBoard, whiteTurn);
  };

  const isSelectionValid = (square) => {
    const piece = square.piece;
    if (!piece && !selectedPiece) {
      return false;
    }
    if (whiteTurn && piece.color !== 'white') {
      return false;
    }
    if (!whiteTurn && piece.color !== 'black') {
      return false;
    }
    return true;
  };

  if (whiteTurn === true) {
    var player = 'White';
    var opponent = "Black";
  }
  else {
    var player = 'Black';
    var opponent = 'White';
  }
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full flex flex-row md:w-2/3">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((square) => {
                return (
                  <Square
                    key={square.id}
                    square={square}
                    onClick={() => handleSquareClick(square, square.piece.color)}
                    isSelected={selectedPiece?.id === square.id}
                  />
                )
              })}
            </div>
          ))}
          <div className="surfice"></div>
          <div className="extra-surfice">
            <h1 className="text-2xl font-bold"></h1>
          </div>
        </div>
        <span className={`turn-advice bg-${player.toLowerCase()} text-${opponent.toLowerCase()}`}><b>{player}</b> turn</span>
      </div>
      <div className="w-full lg:w-1/3">
        <h1 className="text-2xl font-bold">Omega Chess</h1>
        <div className="card p-2 mt-2 text-left">
          <div className="text-lg bold text-center">Rules</div>
          <div className="text-sm">A Pawn can move one, two or three squares forward and after that, only one square at a time.</div>
          <div className="text-sm"><b>The Champion</b> <div className="mini-svg"><img height="14" className="inline" src="/pieces/black-champion.svg" /></div>, like the Knight, is classified as a leaper. It can move one square orthogonally, forward, backward or to either side. Or the Champion can jump two squares forward or backward or to either side, or jump two squares diagonally in all four directions. The Champion can jump over pieces and it can control up to twelve squares.The Champion cannot move one square diagonally.</div>
          <div className="text-sm"><b>The Wizard</b> <div className="mini-svg"><img height="14" className="inline" src="/pieces/black-wizard.svg" /></div> is also classified as a leaper. It can move one square diagonally in all four directions. Or, like an exaggerated Knight move, the Wizard can jump three squares horizontally or vertically and then one square to either side. The Wizard is bound to the color of its starting square. The Wizard can jump over pieces to also control up to twelve squares.</div>
          <div className="text-sm">The Wizard squares are part of the board and can be occupied by any piece (except for pawns and rooks, which have no way of getting there)</div>
        </div>
        <div className="inline"><a href="https://omegachess.com">Omega Chess Official Website</a></div>
      </div>
    </div>
  )
};

export default OmegaChess;

