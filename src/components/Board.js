import React, { Component } from 'react';
import axios from 'axios';

class Board extends Component {

  constructor() {
    super();
    this.state = { 
      board: ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
      disabled: [true, true, true, true, true, true, true, true, true],
      turn: 'X',
      winner: null,
      result: '',
      round: 0
    };
  }

  start = () => {
    axios.post('/api/rounds').then(response => {
      if(response.data) {
        this.setState({ round: response.data.id });
        this.setState({ board: ['-', '-', '-', '-', '-', '-', '-', '-', '-'] });
        this.setState({ disabled: [false, false, false, false, false, false, false, false, false] });
        this.setState({ turn: 'X' });
        this.setState({ winner: response.data.winner });
        this.setState({ result: '' });
      }
    }).catch(err => console.log(err));
  }

  componentDidMount() {
    this.getLastRound();
  }

  getLastRound = () => {
    axios.get('/api/rounds-last').then(response => {
      if(response.data) {
        //console.log(this.state);
        if(response.data[0].winner === null) {
          this.setState({ round: response.data[0].id });
          this.getMoves(response.data[0].id);
        }
      }
    }).catch(err => console.log(err));
  }

  getMoves = (id) => {
    axios.get('/api/rounds/'+id+'/moves').then(response => {
      console.log(response.data);
      console.log(this.state);
      if(response.data) {
        //TODO: parse data and update state for board and disabled keys
        if(response.data.length === 0) {
          this.setState({ disabled: [false, false, false, false, false, false, false, false, false] });
        } else {
          let board = this.state.board;
          let disabled = [false, false, false, false, false, false, false, false, false];
          let position = -1;
          
          for(let i=0; i<response.data.length; i++) {
            position = parseInt(response.data[i].position);
            board[position] = response.data[i].player;
            disabled[position] = true;
          }

          this.setState({ board: board, disabled: disabled });
        }
      }
    }).catch(err => console.log(err));
  }

  addMove = (move) => {
    //TODO: change url to /api/rounds/:id/moves
    axios.post('/api/moves', move).then(response => {
      if(response.data) {
        console.log('Successfully added!');
      }
    }).catch(err => console.log(err));
  }

  updateRoundResult = () => {
    axios.put('/api/rounds/'+ this.state.round, { winner: this.state.winner }).then(response => {
      if(response.data) {
        console.log('Result saved!');
      }
    }).catch(err => console.log(err));
  }

  replay = () => {
    let board = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
    let disabled = [false, false, false, false, false, false, false, false, false];
    this.setState({ board: board });
    this.setState({ disabled: disabled });
    this.setState({ turn: 'X' });
    this.setState({ winner: null });
    this.setState({ result: '' });
    this.setState({ round: 0 });
  }

  playersMove = (position) => {
    console.log(position);
    let board = this.state.board;
    let disabled = this.state.disabled;
    let turn = this.state.turn;
    const move = { round_id: this.state.round, position: position.toString(), player: this.state.turn };
    this.addMove(move);

    if(this.state.turn === 'X') {
      board[position] = 'X';
      turn = 'O';
    } else {
      board[position] = 'O';
      turn = 'X';
    }

    disabled[position] = true;
    this.setState({ board: board, disabled: disabled, turn: turn, winner: this.checkWinner() }, () => {
      console.log(this.state);
      if(this.state.winner != null) {
        console.log(this.state.winner);
        if(this.state.winner !== 'draw') {
          this.setState({ result: 'Congratulations! ' + this.state.winner + ' is the winner!' });
        } else {
          this.setState({ result: "It's a draw! Thanks for playing."});
        }

        this.setState({ disabled: [true, true, true, true, true, true, true, true, true] });

        this.updateRoundResult();
        this.setState({ round: 0 });
      }
    });
  }

  checkWinner = () => {
    for(let i=0; i<8; i++) {
      let line = '';

      switch (i) {
        case 0:
          line = this.state.board[0] + this.state.board[1] + this.state.board[2];
          break;
        case 1:
          line = this.state.board[3] + this.state.board[4] + this.state.board[5];
          break;
        case 2:
          line = this.state.board[6] + this.state.board[7] + this.state.board[8];
          break;
        case 3:
          line = this.state.board[0] + this.state.board[3] + this.state.board[6];
          break;
        case 4:
          line = this.state.board[1] + this.state.board[4] + this.state.board[7];
          break;
        case 5:
          line = this.state.board[2] + this.state.board[5] + this.state.board[8];
          break;
        case 6:
          line = this.state.board[0] + this.state.board[4] + this.state.board[8];
          break;
        case 7:
          line = this.state.board[2] + this.state.board[4] + this.state.board[6];
          break;
        default:
          line = '';
      }
      
      if(line === 'XXX') {
        return 'X';
      } else if(line === 'OOO') {
        return 'O';
      }
    }

    for(let i=0; i<9; i++) {
      if(this.state.board[i] === '-') {
        break;
      } else if(i === 8) {
        return 'draw';
      }
    }
    
    return null;
  }

  render() {
    //let { moves } = this.state;
    // Make buttons disabled once selected by a player
    const boardCell = {
      marginBottom: 0,
      borderRadius: 0,
    };

    return(
      <div className="container-fuild">
        <h1>Welcome to 2 Player Tic-Tac-Toe game.</h1>
        <hr />

        <div className="row justify-content-md-center alert alert-info">Player: X vs Player: O</div>

        <div className="row justify-content-md-center">
          <button className="btn btn-primary" onClick={ () => this.start() } disabled={this.state.round !== 0 }>Start playing</button>
        </div>

        <div className={ this.state.result === '' && this.state.round !== 0 ? 'row justify-content-md-center' : 'hidden' }>
          <strong>{this.state.turn}</strong>&nbsp;your turn; Select your slot to place&nbsp;<strong>{this.state.turn} </strong> &nbsp;in:
        </div>

        <div className="row justify-content-md-center">&nbsp;{this.state.result}</div>

        <div className="row justify-content-md-center">
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(0) }
              disabled={this.state.disabled[0] }>{ this.state.board[0] }
            </button>
          </div>
          <div className="col-md-1 alert alert-primary"  style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(1) }
              disabled={this.state.disabled[1] }>{ this.state.board[1] }
            </button>
          </div>
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(2) }
              disabled={this.state.disabled[2] }>{ this.state.board[2] }
            </button>
          </div>
        </div>

        <div className="row justify-content-md-center">
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(3) }
              disabled={this.state.disabled[3] }>{ this.state.board[3] }</button>
          </div>
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(4) }
              disabled={this.state.disabled[4] }>{ this.state.board[4] }
            </button>
          </div>
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(5) }
              disabled={this.state.disabled[5] }>{ this.state.board[5] }
            </button>
          </div>
        </div>

        <div className="row justify-content-md-center">
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(6) }
              disabled={this.state.disabled[6] }>{ this.state.board[6] }
            </button>
          </div>
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(7) }
              disabled={this.state.disabled[7] }>{ this.state.board[7] }
            </button>
          </div>
          <div className="col-md-1 alert alert-primary" style={boardCell}>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-block" 
              onClick={ () => this.playersMove(8) }
              disabled={this.state.disabled[8] }>{ this.state.board[8] }
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Board;

