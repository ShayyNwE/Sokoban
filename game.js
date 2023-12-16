const canvas = document.getElementById('jeu');
    const context = canvas.getContext('2d');


    const grid = 64;


    const wallCanvas = document.createElement('canvas');
    const wallContext = wallCanvas.getContext('2d');
    wallCanvas.width = wallCanvas.height = grid;


    wallContext.fillStyle = '#919089';
    wallContext.fillRect(0, 0, grid, grid);

    const types = {
      wall: '#',
      player: '*',
      playerOnGoal: '+',
      box: 'B',
      boxOnGoal: 'G',
      goal: '.',
      empty: ' '
    };

    // Array of game levels
    const levels = [
      // Level 1
      `
      #####
    ###   #
    #.*B  #
    ### B.#
    #.##B #
    # # . ##
    #B GBB.#
    #   .  #
    ########

      `,

      // Level 2
      `
      #####
      #   #
      #B  #
    ###  B##
    #  B B #
  ### # ## #   ######
  #   # ## #####  ..#
  # B  B          ..#
  ##### ### #*##  ..#
      #     #########
      #######`,

      // Level 3
      `
    ############
    #..  #     ###
    #..  # B  B  #
    #..  #B####  #
    #..    * ##  #
    #..  # #  B ##
    ###### ##B B #
      # B  B B B #
      #    #     #
      ############`,

      // Level 4
      `
            ########
            #     *#
            # B#B ##
            # B  B#
            ##B B #
    ######### B # ###
    #....  ## B  B  #
    ##...    B  B   #
    #....  ##########
    ########        `
    ];

    let playerDirection = { row: 0, col: 0 };
    let playerPosition = { row: 0, col: 0 };
    let animationFrame = null;
    let width = 0;
    let height = 0;
    let cells = [];
    let levelIndex = 0;

    function loadLevel(level) {
      cells.length = 0;
      width = 0;

      level.split('\n')
        .filter(rowData => !!rowData)
        .forEach((rowData, row) => {
          cells[row] = [];

          if (rowData.length > width) {
            width = rowData.length;
          }

          rowData.split('').forEach((colData, col) => {
            cells[row][col] = colData;

            if (colData === types.player || colData === types.playerOnGoal) {
              playerPosition = { row, col };
            }
          });
        });

      height = cells.length;
      canvas.width = width * grid;
      canvas.height = height * grid;
    }

    function move(start, end) {
      const startCell = cells[start.row][start.col];
      const endCell = cells[end.row][end.col];

      const isPlayer = startCell === types.player || startCell === types.playerOnGoal;

      switch (startCell) {
        case types.player:
        case types.box:
          cells[start.row][start.col] = types.empty;
          break;

        case types.playerOnGoal:
        case types.boxOnGoal:
          cells[start.row][start.col] = types.goal;
          break;
      }

      switch (endCell) {
        case types.empty:
          cells[end.row][end.col] = isPlayer ? types.player : types.box;
          break;

        case types.goal:
          cells[end.row][end.col] = isPlayer ? types.playerOnGoal : types.boxOnGoal;
          break;
      }
    }

    function displayVictory() {
      cancelAnimationFrame(animationFrame);

      context.fillStyle = 'black';
      context.globalAlpha = 0.75;
      context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

      context.globalAlpha = 1;
      context.fillStyle = 'white';
      context.font = '18px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('Congratulations! You have won the level!', canvas.width / 2, canvas.height / 2);


      setTimeout(() => {
        transitionToNextLevel();
      }, 1000);
    }

    function transitionToNextLevel() {
        levelIndex++;
      
        if (levels[levelIndex]) {
          loadLevel(levels[levelIndex]);
          requestAnimationFrame(gameLoop);
          updateNextLevelButtonVisibility();
        } else {
          context.fillText('Congratulations, Game completed! No more levels.', canvas.width / 2, canvas.height / 2 + 30);
        }
      }

    function gameLoop() {
      animationFrame = requestAnimationFrame(gameLoop);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const row = playerPosition.row + playerDirection.row;
      const col = playerPosition.col + playerDirection.col;
      const cell = cells[row][col];

      switch (cell) {
        case types.empty:
        case types.goal:
          move(playerPosition, { row, col });

          playerPosition.row = row;
          playerPosition.col = col;
          break;

        case types.wall:
          break;

        case types.box:
        case types.boxOnGoal:
          const nextRow = row + playerDirection.row;
          const nextCol = col + playerDirection.col;
          const nextCell = cells[nextRow][nextCol];

          if (nextCell === types.empty || nextCell === types.goal) {
            move({ row, col }, { row: nextRow, col: nextCol });
            move(playerPosition, { row, col });

            playerPosition.row = row;
            playerPosition.col = col;
          }
          break;
      }

      playerDirection = { row: 0, col: 0 };

      let allBoxesOnGoal = true;

      for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[row].length; col++) {
          const cell = cells[row][col];

          if (cell === types.wall) {
            context.drawImage(wallCanvas, col * grid, row * grid);
          }

          if (cell === types.box || cell === types.boxOnGoal) {
            if (cell === types.box) {
              context.fillStyle = '#D2691E';
              allBoxesOnGoal = false;
            } else {
              context.fillStyle = '#7E5835';
            }

            context.fillRect(col * grid, row * grid, grid, grid);

            context.beginPath();
            context.moveTo((col + 0.1) * grid, (row + 0.1) * grid);
            context.lineTo((col + 0.9) * grid, (row + 0.9) * grid);
            context.moveTo((col + 0.9) * grid, (row + 0.1) * grid);
            context.lineTo((col + 0.1) * grid, (row + 0.9) * grid);
            context.stroke();
          }

          if (cell === types.goal || cell === types.playerOnGoal) {
            context.fillStyle = '#887d91';
            context.beginPath();
            context.arc((col + 0.5) * grid, (row + 0.5) * grid, 10, 0, Math.PI * 2);
            context.fill();
          }

          if (cell === types.player || cell === types.playerOnGoal) {
            context.fillStyle = 'black';
            context.beginPath();

            context.arc((col + 0.5) * grid, (row + 0.3) * grid, 8, 0, Math.PI * 2);
            context.fill();
            context.fillRect((col + 0.48) * grid, (row + 0.3) * grid, 2, grid / 2.5);
            context.fillRect((col + 0.3) * grid, (row + 0.5) * grid, grid / 2.5, 2);
            context.moveTo((col + 0.5) * grid, (row + 0.7) * grid);
            context.lineTo((col + 0.65) * grid, (row + 0.9) * grid);
            context.moveTo((col + 0.5) * grid, (row + 0.7) * grid);
            context.lineTo((col + 0.35) * grid, (row + 0.9) * grid);
            context.stroke();
          }
        }
      }

      if (allBoxesOnGoal && levelIndex < levels.length - 1) {
        displayVictory();
      } else if (levelIndex === levels.length - 1 && allBoxesOnGoal) {
        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '18px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Congratulations! Game completed! No more levels.', canvas.width / 2, canvas.height / 2);

        cancelAnimationFrame(animationFrame);
      }
    }

    function restartLevel() {
      cancelAnimationFrame(animationFrame);

      playerDirection = { row: 0, col: 0 };
      playerPosition = { row: 0, col: 0 };

      loadLevel(levels[levelIndex]);
      requestAnimationFrame(gameLoop);
    }

    function nextLevel() {
        cancelAnimationFrame(animationFrame);
        transitionToNextLevel();
      }

    function updateNextLevelButtonVisibility() {
    const nextLevelButton = document.getElementById('nextLevelButton');
      
    if (levelIndex === levels.length - 1) {
          
          nextLevelButton.style.display = 'none';
    } else {
          
          nextLevelButton.style.display = 'block';
    }
    }
    updateNextLevelButtonVisibility();
    document.getElementById('restartButton').addEventListener('click', restartLevel);
    document.getElementById('nextLevelButton').addEventListener('click', nextLevel);

    document.addEventListener('keydown', function (e) {
      playerDirection = { row: 0, col: 0 };

      if (e.which === 37) {
        playerDirection.col = -1;
      } else if (e.which === 38) {
        playerDirection.row = -1;
      } else if (e.which === 39) {
        playerDirection.col = 1;
      } else if (e.which === 40) {
        playerDirection.row = 1;
      }
    });

    loadLevel(levels[levelIndex]);
    requestAnimationFrame(gameLoop);