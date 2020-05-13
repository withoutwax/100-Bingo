import React, { useState, useEffect } from 'react';

const GameBoard: React.FC = () => {
    const [tableElement, setTableElement] = useState<any[]>([]);

    useEffect(() => {
        const columnCount = 3;
        const rowCount = 3;
        let counter = 1;
        
        for (let i = 0; i < rowCount; i++) {

            let columnElement: any[] = [];
            for (let j = 0; j < columnCount; j++) {
                console.log(columnElement);
                columnElement.push(counter);
                counter += 1;
            }

            setTableElement(tableElement => [...tableElement, columnElement]);
        }
    }, []);

    const updateTable = (e: any) => {
        console.log('Target ID:', e.target.id);
        e.target.innerHTML = '😍';
    }
    
    console.log(tableElement);
    return (
        <main className="gameboard-container">

            <table>
                <tbody>
                    {tableElement.map((column: any, index: number) => (
                        <tr key={index}>
                            {column.map((item: string, index: number) => (
                                <td onClick={updateTable} key={index} id={item}>{item}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </main>
    );
}

export default GameBoard;