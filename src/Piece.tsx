import React, { useEffect, useImperativeHandle, useState, useContext } from 'react';
import './App.css';
import { ThemeContext } from './context/ThemeContext';

type PieceType = {
  id: string;
  color: string;
  name: string;
  location: number;

};

type PieceProps = {
  id: string;
  color: string;
  name: string;
  location: number;
  legitimatePaths?: number[];
  onPieceClick: (id: string, location: number) => void;
  ref?: React.Ref<any>;

};

//const Piece: React.FC<PieceProps> = forwardRef((props, ref) => {
const Piece: React.FC<PieceProps> = (props) => {
  const [id, setId] = useState<string>(props.id);
  const [color, setColor] = useState<string>(props.color);
  const [name, setName] = useState<string>(props.name);
  const [location, setLocation] = useState<number>(props.location);
  const [legitimatePaths, setLegitimatePaths] = useState<number[]>(); // array of legitimate locations for me to move
  const mytheme = useContext(ThemeContext);
  //if (!mytheme) {
   // throw new Error('ThemeContext is not provided');
  //}
  useEffect(() => {
    //console.log('Board in Piece useEffect:', props.board.map((p) => p.name));
    setId(props.id);
    setName(props.name);
    setColor(props.color);
    setLocation(props.location);
  }, [props]);

  useImperativeHandle(props.ref, () => ({
    getName: () => props.name,
    getLegitimatePaths: () => legitimatePaths,
  }));

  const styles: React.CSSProperties = {
    backgroundColor: color,
    color: mytheme?.theme === 'dark' ? 'white' : 'black',

    width: '100%',
    height: '100%',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
  };

  return (
    <div className="card">
      <button onClick={() => props.onPieceClick(id, location)} style={styles}>
        {name}, {id} At {location}
      </button>
    </div>
  );
};

export default Piece;