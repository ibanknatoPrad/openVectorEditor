var Sector = require('paths-js/sector');
var getRangeAngles = require('ve-range-utils/getRangeAngles');
let Cutsite = require('./Cutsite');
let CircularFeature = require('./CircularFeature');
var calculateTickMarkPositionsForGivenRange = require('./calculateTickMarkPositionsForGivenRange');
var StyleFeature = require('./StyleFeature');

import assign from 'lodash/object/assign'
import React, { PropTypes } from 'react';
import { Decorator as Cerebral } from 'cerebral-react';
import { propTypes } from './react-props-decorators.js'; //tnrtodo: update this once the actual npm module updates its dependencies
var Draggable = require('react-draggable');

@Cerebral({
    circularViewDimensions: ['circularViewDimensions'],
    circularViewData: ['circularViewData'],
    charWidth: ['charWidth'],
    selectionLayer: ['selectionLayer'],
    cutsiteLabelSelectionLayer: ['cutsiteLabelSelectionLayer'],
    annotationHeight: ['annotationHeight'],
    spaceBetweenAnnotations: ['spaceBetweenAnnotations'],
    circularAndLinearTickSpacing: ['circularAndLinearTickSpacing'],
    showFeatures: ['showFeatures'],
    showTranslations: ['showTranslations'],
    showParts: ['showParts'],
    showOrfs: ['showOrfs'],
    showAxis: ['showAxis'],
    showSequence: ['showSequence'],
    showCutsites: ['showCutsites'],
    showReverseSequence: ['showReverseSequence'],
    caretPosition: ['caretPosition'],
    sequenceLength: ['sequenceLength'],
    bpsPerRow: ['bpsPerRow']
})
@propTypes({
    circularViewDimensions: PropTypes.object.isRequired,
    circularViewData: PropTypes.object.isRequired,
    charWidth: PropTypes.number.isRequired,
    selectionLayer: PropTypes.object.isRequired,
    cutsiteLabelSelectionLayer: PropTypes.object.isRequired,
    annotationHeight: PropTypes.number.isRequired,
    circularAndLinearTickSpacing: PropTypes.number.isRequired,
    spaceBetweenAnnotations: PropTypes.number.isRequired,
    showFeatures: PropTypes.bool.isRequired,
    showTranslations: PropTypes.bool.isRequired,
    showParts: PropTypes.bool.isRequired,
    showOrfs: PropTypes.bool.isRequired,
    showAxis: PropTypes.bool.isRequired,
    showCutsites: PropTypes.bool.isRequired,
    showReverseSequence: PropTypes.bool.isRequired,
    caretPosition: PropTypes.number.isRequired,
    sequenceLength: PropTypes.number.isRequired,
    bpsPerRow: PropTypes.number.isRequired,
    handleEditorDrag: PropTypes.func.isRequired,
    handleEditorDragStart: PropTypes.func.isRequired,
    handleEditorDragStop: PropTypes.func.isRequired,
    handleEditorClick: PropTypes.func.isRequired,
})
class CircularView extends React.Component {
    getNearestCursorPositionToMouseEvent(event, sequenceLength, callback) {
        var boundingRect = this.refs.circularView.getBoundingClientRect()
        //get relative click positions
        var clickX = (event.clientX - boundingRect.left - boundingRect.width/2)
        var clickY = (event.clientY - boundingRect.top - boundingRect.height/2)
        console.log('clickX: ' + JSON.stringify(clickX,null,4));
        console.log('clickY: ' + JSON.stringify(clickY,null,4));
        //get angle

        var angle = Math.atan2(clickY, clickX) + Math.PI/2
        if (angle < 0) angle += Math.PI * 2
        console.log('angle: ' + JSON.stringify(angle,null,4));
        var dragInitiatedByGrabbingCaret = event.target.className === "cursor"
        var nearestBP = Math.floor(angle / Math.PI / 2 * sequenceLength)
        callback({
            shiftHeld: event.shiftHeld,
            nearestBP, 
            dragInitiatedByGrabbingCaret //tnr: come back and fix this
        })
    }

    render() {
        var { showSequence, circularViewDimensions, circularViewData, handleEditorDrag, handleEditorDragStart, handleEditorDragStop, handleEditorClick, charWidth, selectionLayer, cutsiteLabelSelectionLayer, annotationHeight, circularAndLinearTickSpacing, spaceBetweenAnnotations, showFeatures, showTranslations, showParts, showOrfs, showAxis, showCutsites, showReverseSequence, caretPosition, sequenceLength, bpsPerRow, signals} = this.props;
        const baseRadius = 80;
        var currentRadius = baseRadius;
        var totalAnnotationHeight = annotationHeight + spaceBetweenAnnotations;
        var annotationsSvgs = [];

        if (showFeatures) {
            var maxYOffset = 0;
            circularViewData.features.forEach(function(annotation, index) {
                var {startAngle, endAngle, totalAngle} = getRangeAngles(annotation, sequenceLength);
                if (annotation.yOffset > maxYOffset) {
                    maxYOffset = annotation.yOffset;
                }

                annotationsSvgs.push(
                    <PositionAnnotationOnCircle
                      key={ index }
                      sAngle={ startAngle }
                      eAngle={ endAngle }
                      direction={ 'reverse' }>
                      <StyleFeature
                        signals={signals}
                        annotation={annotation}
                        color={ annotation.color }>
                        <CircularFeature
                          radius={ currentRadius }
                          annotationHeight={ annotationHeight }
                          totalAngle={ totalAngle }>
                        </CircularFeature>
                      </StyleFeature>
                    </PositionAnnotationOnCircle>
                )
                currentRadius += maxYOffset + 1 * totalAnnotationHeight
            })
        }

        if (showAxis) {
            var tickMarkHeight = 10;
            var tickMarkWidth = 1;
            var textOffset = 20

            var axisLineThickness = 4;
            currentRadius += textOffset + tickMarkHeight + axisLineThickness


            var tickPositions = calculateTickMarkPositionsForGivenRange({
                range: {
                    start: 0,
                    end: sequenceLength
                },
                tickSpacing: circularAndLinearTickSpacing
            });

            var tickMarksAndLabels = tickPositions.map(function(tickPosition, index) {
                
                var tickAngle = getAngleForPositionMidpoint(tickPosition, sequenceLength);
                var flip = false;
                if ((tickAngle > Math.PI * 0.5) && (tickAngle < Math.PI * 1.5)) {
                    flip = true
                }
                return (
                    <PositionAnnotationOnCircle
                      key={ index }
                      sAngle={ tickAngle }
                      eAngle={ tickAngle }
                      height={ currentRadius }>
                      <text
                        transform={ (flip ? 'rotate(180)' : '') + ` translate(0, ${flip ? -textOffset : textOffset})` }
                        style={ {    textAnchor: "middle",    dominantBaseline: "central",    fontSize: 'small'} }>
                        { tickPosition }
                      </text>
                      <rect
                        width={ tickMarkWidth }
                        height={ tickMarkHeight }>
                      </rect>
                    </PositionAnnotationOnCircle>
                    )
            })
            annotationsSvgs.push(
                <g>
                  { tickMarksAndLabels }
                  <circle
                    r={ currentRadius }
                    style={ {    fill: 'none',    stroke: 'black',    strokeWidth: 1} }>
                  </circle>
                </g>
            )

        }
        var innerRadius = baseRadius - annotationHeight / 2; //tnr: -annotationHeight/2 because features are drawn from the center

        if (selectionLayer.selected) {
            var {startAngle, endAngle, totalAngle} = getRangeAngles(selectionLayer, sequenceLength)
            var sector = Sector({
                center: [0, 0], //the center is always 0,0 for our annotations :) we rotate later!
                r: baseRadius - annotationHeight / 2,
                R: currentRadius,
                start: 0,
                end: totalAngle
            });
            annotationsSvgs.push(
                <PositionAnnotationOnCircle
                  sAngle={ startAngle }
                  eAngle={ endAngle }
                  height={ 0 }>
                  <path
                    style={ {    opacity: .4} }
                    d={ sector.path.print() }
                    fill="blue" />
                </PositionAnnotationOnCircle>)
                annotationsSvgs.push(
                <Caret 
                    key='caretStart'
                    caretPosition={selectionLayer.start}
                    sequenceLength={sequenceLength}
                    innerRadius={innerRadius}
                    outerRadius={currentRadius}
                />)
                annotationsSvgs.push(
                <Caret 
                    key='caretEnd'
                    caretPosition={selectionLayer.end + 1}
                    sequenceLength={sequenceLength}
                    innerRadius={innerRadius}
                    outerRadius={currentRadius}
                />)
        }

        if (caretPosition !== -1 && !selectionLayer.selected) {
            annotationsSvgs.push(
                <Caret 
                    caretPosition={caretPosition}
                    sequenceLength={sequenceLength}
                    innerRadius={innerRadius}
                    outerRadius={currentRadius}
                />
            )
        }
        var circViewStyle = assign({}, circularViewDimensions, {
            height: circularViewDimensions.height,
            // overflow: 'scroll',
        })
        var maxDistance = circularViewDimensions.height
        if (circularViewDimensions.height < circularViewDimensions.width) {
            maxDistance = circularViewDimensions.width
        }
        var scale = ''
        if (currentRadius > maxDistance) {
            scale = ``
        }
        return (
            <Draggable
            bounds={{top: 0, left: 0, right: 0, bottom: 0}}
            onDrag={(event) => {
                this.getNearestCursorPositionToMouseEvent(event, sequenceLength, handleEditorDrag)}   
            }
            onStart={(event) => {
                this.getNearestCursorPositionToMouseEvent(event, sequenceLength, handleEditorDragStart)}   
            }
            onStop={handleEditorDragStop}
            
            >
                <div style={ circViewStyle }>
                  <svg
                  onClick={(event) => {
                    this.getNearestCursorPositionToMouseEvent(event, sequenceLength, handleEditorClick)}   
                }
                    width={ circularViewDimensions.width }
                    height={ circularViewDimensions.height }>
                    <g 
                    ref='circularView'
                    transform={ `scale(${maxDistance/currentRadius/2},${maxDistance/currentRadius/2}) translate(${currentRadius},${currentRadius}) ` }>
                      { annotationsSvgs }
                    </g>
                  </svg>
                </div>
            </Draggable>
            );
    }
}


module.exports = CircularView;

function Caret ({caretPosition, sequenceLength, innerRadius, outerRadius}) {
    var caretWidth = .01;
    var {startAngle, endAngle} = getRangeAngles({start: caretPosition, end:caretPosition}, sequenceLength)
    return (
        <PositionAnnotationOnCircle
          sAngle={ startAngle }
          eAngle={ endAngle }
          height={ 0 }>
          <line
            style={ { className:"cursor", opacity: 9} }//tnr: the classname needs to be cursor here!
            x1={0}
            y1={-innerRadius}
            x2={0}
            y2={-outerRadius}
            stroke="black" />
        </PositionAnnotationOnCircle>
    )
}

var PositionAnnotationOnCircle = function({children, height=0, sAngle=0, eAngle=0, forward=true}) {
    const sAngleDegs = sAngle * 360 / Math.PI / 2
    const eAngleDegs = eAngle * 360 / Math.PI / 2
    var transform;
    if (forward) {
        transform = `translate(0,${-height}) rotate(${sAngleDegs},0,${height})`
    } else {
        transform = `scale(-1,1) translate(0,${-height}) rotate(${-eAngleDegs},0,${height}) `
    }
    return (
        <g transform={ transform }>
          { children }
        </g>
        )
}

function getAngleForPositionMidpoint(position, maxLength) {
    return (position + 0.5) / maxLength * Math.PI * 2;
}