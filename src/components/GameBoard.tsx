import React, { useState, useEffect, FunctionComponent } from 'react';
import { socket } from '../service/socket';

interface GameBoardProps {
    chooseNumber: string;
    username: string;
    room: string;
    gameOver: ((winner: string) => void);
    gameStart: boolean;
    gameReset: any;
    gameResetFunction: (() => void);
}
interface tableElementMap {
    index: number;
    value: string;
    toggleEdit: boolean;
    selected: boolean;
}

const GameBoard: React.FC<GameBoardProps> = (props) => {
    const [tableElement, setTableElement] = useState<Array<Array<tableElementMap>>>([]);
    const [chooseNumberArray, setChooseNumberArray] = useState<string[]>([]);
    const [totalTableElement, setTotalTableElement] = useState<number>(0);

    useEffect(() => {
        const columnCount = 3;
        const rowCount = 3;
        let counter = 1;
        
        for (let i = 0; i < rowCount; i++) {

            let columnElement: Array<tableElementMap> = [];
            for (let j = 0; j < columnCount; j++) {
                const element = {
                    index: counter,
                    value: String(counter),
                    toggleEdit: false,
                    selected: false
                };
                columnElement.push(element);
                counter += 1;
            }

            setTableElement(tableElement => [...tableElement, columnElement]);
        }

        // setTotalTableElement(counter - 1);
        setTotalTableElement(2);
    }, []);

    useEffect(() => {
        console.log('Game Reset Setting:', props.gameReset);
        if (props.gameReset !== false) {
            setTableElement([]);
            setChooseNumberArray([]);
            setTotalTableElement(0);

            props.gameResetFunction();
            console.log('Game has resetted');
        }
        if (props.chooseNumber !== undefined && !chooseNumberArray.includes(props.chooseNumber)) {
            setChooseNumberArray(chooseNumberArray => [...chooseNumberArray, props.chooseNumber]);
        }

        // Check if all the elements are selected
        let selectedElement = 0;
        if (tableElement.length > 0) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (tableElement[i][j].selected) {
                        selectedElement += 1;
                    }   
                }
            }
        }

        // console.log(selectedElement, totalTableElement);
        if (selectedElement != 0 && totalTableElement != 0 && selectedElement === totalTableElement) {
            props.gameOver(props.username);
        }
    });

    const numberCheck = (i: number, j: number, data: tableElementMap): string => {
        if (chooseNumberArray.includes(data.value)) {
            tableElement[i][j].selected = true;
            return 'red'
        } else {
            return 'white';
        }
    };
    const enableEdit = (i: number, j: number) => {
        if (!props.gameStart) {
            let tableElementUpdate = [...tableElement];
            tableElementUpdate[i][j].toggleEdit = true;
    
            setTableElement(tableElementUpdate);
        }
    };
    const saveNumber = (i: number, j: number, number: string) => {
        let tableElementUpdate = [...tableElement];
        tableElementUpdate[i][j].toggleEdit = false;
        tableElementUpdate[i][j].value = number;
        setTableElement(tableElementUpdate);
    };
    const inputElement = (i: number, j: number) => {
        let number: string;

        return (
            <div>
                <input 
                    type="text" 
                    name="selectNumber" 
                    id="selectNumber" 
                    placeholder="Enter a new number" 
                    onChange={(event) => {number = event.target.value}}/>
                <button onClick={() => {saveNumber(i, j, number)}}>Save</button>
            </div>
        );
    };
    return (
        <main className="gameboard-container">

            <table>
                <tbody>
                    {tableElement.map((column: any, i: number) => (
                        <tr key={i}>
                            {column.map((item: tableElementMap, j: number) => (
                                <td key={item.index}> 
                                    <div
                                        onClick={() => (enableEdit(i, j))} 
                                        id={String(item.index)}
                                        style={{backgroundColor: numberCheck(i, j, item)}}
                                    >{item.toggleEdit ? null : item.value}</div>
                                    <div>{item.toggleEdit ? inputElement(i, j) : null}</div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </main>
    );
}

export default GameBoard;