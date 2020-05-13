import React, { useState, useEffect } from 'react';

const GameBoard: React.FC = () => {
    const [tableElement, setTableElement] = useState<any[]>([]);

    useEffect(() => {
        const columnCount = 3;
        const rowCount = 3;
        
        for (let i = 0; i < rowCount; i++) {

            let columnElement: any[] = [];
            for (let j = 0; j < columnCount; j++) {
                console.log(columnElement);
                columnElement.push(j);
            }

            setTableElement(tableElement => [...tableElement, columnElement]);
        }

    }, []);
    
    console.log(tableElement);
    return (
        <main className="gameboard-container">

            <table>
                <tbody>
                    {tableElement.map((column: any, index: number) => (
                        <tr key={index}>
                            {column.map((item: string, index: number) => (
                                <td key={index}>{item}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </main>
    );
}

export default GameBoard;