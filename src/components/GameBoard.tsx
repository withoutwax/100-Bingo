import React, { useState, useEffect, FunctionComponent } from 'react';
import { socket } from '../service/socket';

interface GameBoardProps {
    chooseNumber: string;
    username: string;
    room: string;
    gameOver: ((winner: string) => void);
}
interface tableElementMap {
    index: number;
    value: string;
    toggleEdit: boolean;
}

const GameBoard: React.FC<GameBoardProps> = (props) => {
    const [tableElement, setTableElement] = useState<Array<Array<tableElementMap>>>([]);
    const [chooseNumberArray, setChooseNumberArray] = useState<string[]>([]);
    const [totalTableElement, setTotalTableElement] = useState<number>(0);
    const [checkedTableElement, setCheckedTableElement] = useState<number>(1);

    useEffect(() => {
        const columnCount = 3;
        const rowCount = 3;
        let counter = 1;
        
        for (let i = 0; i < rowCount; i++) {

            let columnElement: Array<tableElementMap> = [];
            for (let j = 0; j < columnCount; j++) {
                // console.log(columnElement);
                const element = {
                    index: counter,
                    value: String(counter),
                    toggleEdit: false
                };
                columnElement.push(element);
                counter += 1;
            }

            setTableElement(tableElement => [...tableElement, columnElement]);
        }

        // setTotalTableElement(counter);
        setTotalTableElement(3); // TODO: Change this to counter
    }, []);

    useEffect(() => {
        // console.log('Props', props.chooseNumber);
        if (props.chooseNumber != undefined && !chooseNumberArray.includes(props.chooseNumber)) {
            setChooseNumberArray(chooseNumberArray => [...chooseNumberArray, props.chooseNumber]);
        }
        console.log(chooseNumberArray.length, totalTableElement);
        if (checkedTableElement != 0 && totalTableElement != 0 && chooseNumberArray.length === totalTableElement) {
            // props.gameOver(props.username);
        }
    });

    const numberCheck = (data: tableElementMap): string => {
        if (chooseNumberArray.includes(data.value)) {
            // setCheckedTableElement(checkedTableElement + 1);
            return 'red'
        } else {
            return 'white';
        }
    };
    const enableEdit = (i: number, j: number) => {
        let tableElementUpdate = [...tableElement];
        tableElementUpdate[i][j].toggleEdit = true;

        setTableElement(tableElementUpdate);
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
    
    // console.log(tableElement);
    return (
        <main className="gameboard-container">

            <table>
                <tbody>
                    {tableElement.map((column: any, i: number) => (
                        <tr key={i}>
                            {column.map((item: tableElementMap, j: number) => (
                                <td> 
                                    <div
                                        onClick={() => (enableEdit(i, j))} 
                                        key={item.index} 
                                        id={String(item.index)}
                                        style={{backgroundColor: numberCheck(item)}}
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