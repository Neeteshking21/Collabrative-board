import React, { useRef, useEffect } from 'react';
import io from 'socket.io-client';
import '../Styles/board.css'


const Board = () => {

    /**
     * Creating Refs to Get whiteboard,
     *  color, and socket elements, 
    */
    const canvasRef = useRef(null)
    const colorsRef = useRef(null)
    const socketRef = useRef(null)

    /** 
     * We will now begin our useEffect hook. 
     * It will make sure our code within runs when the component loads. 
    */
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        /** 
         * Now add click listeners to your color palette.
        */
        const colors = document.getElementsByClassName('color');
        const current = {
            color: "black",
        };

        const onColorUpdate = (e) => {
            current.color = e.target.className.split(' ')[1];
        };

        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', onColorUpdate, false);
        }
        let drawing = false;

        const drawLine = (x0, y0, x1, y1, color, emit) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
            if (!emit) {
                return;
            }
            const w = canvas.width;
            const h = canvas.height;
            socketRef.current.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color,
            });
        }

        /* Mouse movement and clicks */
        const onMouseDown = (e) => {
            drawing = true;
            current.x = e.clientX 
            current.y = e.clientY 
        };

        const onMouseMove = (e) => {
            if (!drawing) { return; }
            drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
            current.x = e.clientX 
            current.y = e.clientY 
        };

        const onMouseUp = (e) => {
            if (!drawing) { return; }
            drawing = false;
            drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
        };

        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();

                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        };

        // -----------------add event listeners to our canvas ----------------------

        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', onResize, false);
        onResize();


        /** 
        * create the onDrawingEvent function that will fire when
        * the client-side socket receives a 'drawing' signal from 
        * the server 
        */
        const onDrawingEvent = (data) => {
            const w = canvas.width;
            const h = canvas.height;
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
        }

        socketRef.current = io.connect();
        socketRef.current.on('drawing', onDrawingEvent);

    }, [])
    
    return (
        <div>
        <h1> Lets Draw :)</h1>
            <canvas ref={canvasRef} className="whiteboard" />

            <div ref={colorsRef} className="colors">
                <div className="color black" />
                <div className="color red" />
                <div className="color green" />
                <div className="color blue" />
                <div className="color yellow" />
            </div>
        </div>
    );
}

export default Board