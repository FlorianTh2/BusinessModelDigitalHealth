import { Component, Input, OnInit } from '@angular/core';
import { CanvasSharedDataService } from '@app/canvas/shared/canvas-shared-data.service';
import { CanvasSharedData } from '@app/canvas/shared/models/canvas-shared-data';
import { DistanceData } from '@app/canvas/shared/models/distance-data';
import { PointXY } from '@app/canvas/shared/models/PointXY';
import { Pattern, PatternOrderByInput, Strategy, StrategyPattern } from '@app/graphql/generated/graphql';
import {Chart} from "chart.js";
var ChartAnnotation = require('chartjs-plugin-annotation');


@Component({
  selector: 'app-distance-matrix',
  templateUrl: './distance-matrix.component.html',
  styleUrls: ['./distance-matrix.component.css']
})
export class DistanceMatrixComponent implements OnInit {

  patterns: Pattern[];
  currentPattern: Pattern;
  currentStrategy: Strategy;
  weightsBetweenPatternAndStrategy: StrategyPattern[];
  colorOfPoints = [
      "rgb(179, 157, 219)",
      "rgb(159, 168, 218)",
      "rgb(144, 202, 249)",
      "rgb(129, 212, 250)",
      "rgb(128, 222, 234)",
      "rgb(128, 203, 196)"
  ];
  colorOfPointsRandom: String[];
  chart: Chart;


  constructor(private canvasSharedDataService: CanvasSharedDataService)
  {

  }

  ngOnInit(): void 
  {
    this.subscribePatterns();
    this.subscribeCanvasSharedDataForWeights();
  }

  
  subscribeCanvasSharedDataForWeights()
  {
    this.canvasSharedDataService
      .currentPatternStrategyWeightsObservable
      .subscribe(
          message =>
          {
            this.currentPattern = message.currentPattern;
            this.currentStrategy = message.currentStrategy;
            this.weightsBetweenPatternAndStrategy = message.weightsBetweenPatternAndStrategy;
            this.createChart();
          }
      );
  }

  subscribePatterns()
  {
    this.canvasSharedDataService.patternObservable.subscribe( a => {
      this.patterns = a;
      this.createChart();
    })
  }


  createChart()
  {
    if(this.currentPattern && this.currentStrategy && this.patterns)
    {
      let distanceData: DistanceData;
      distanceData = this.calculateDistances();
      console.log(distanceData);

      this.colorOfPointsRandom = [];
      this.weightsBetweenPatternAndStrategy.forEach(element =>
      {
        this.colorOfPointsRandom.push(this.colorOfPoints[Math.floor((this.colorOfPoints.length-1.0) * Math.random())]);
      });                
      
      if(this.chart)
      {
        this.chart.destroy();
      }
      this.renderChart(distanceData);
    }
    else
    {
      this.renderChart({nameList: [], pointList: []});
    }
  }

  calculateX(basePattern: Pattern, comparePattern: Pattern): Number
  {
    let result: number = 0;
    result +=  Math.pow(basePattern.actorWeight - comparePattern.actorWeight,2);
    result +=  Math.pow(basePattern.valuePropositionWeight - comparePattern.valuePropositionWeight,2);
    result +=  Math.pow(basePattern.valueCreationWeight - comparePattern.valueCreationWeight,2);
    result +=  Math.pow(basePattern.valueDeliveryWeight - comparePattern.valueDeliveryWeight,2);
    result +=  Math.pow(basePattern.revenueWeight - comparePattern.revenueWeight,2);
    result +=  Math.pow(basePattern.expenseWeight - comparePattern.expenseWeight,2);
    result +=  Math.pow(basePattern.networkEffectWeight - comparePattern.networkEffectWeight,2);
    result +=  Math.pow(basePattern.regulatoryWeight - comparePattern.regulatoryWeight,2);
    result +=  Math.pow(basePattern.technicalInfrastructureWeight - comparePattern.technicalInfrastructureWeight,2);
    return Math.sqrt(result);
  }

  calculateY(comparePattern: Pattern): Number
  {
    let neededStrategyPattern: StrategyPattern = this.weightsBetweenPatternAndStrategy.filter(a => a.pattern_id.id == comparePattern.id).pop();
    // 5 is a random high number, used for the "TestPattern" since it has no proper background (/weights)
    return neededStrategyPattern ? neededStrategyPattern.weight : 5;
  }


  calculateDistances(): DistanceData
  {
    let nameList: String[] = [];
    let pointList: PointXY[] = [];

    for(let a = 0; a < this.patterns.length; a++)
    {
      if(!(this.currentPattern.id == this.patterns[a].id))
      {
        nameList.push(this.patterns[a].name);
        pointList.push({x: this.calculateX(this.currentPattern, this.patterns[a]), y: this.calculateY(this.patterns[a])})
      }
    }
    let distanceData: DistanceData = {nameList: nameList, pointList: pointList};
    return distanceData;
  }




  renderChart(distanceData: DistanceData): void
  {

    let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('distance-matrix');
    let ctx = canvas.getContext('2d');


    let chartType = "scatter";

    let chartData = {
      labels: distanceData.nameList,
      datasets: [
        {
          label: 'Business-Model-Pattern',
          pointRadius: 10,
          pointHoverRadius: 15,
          pointHitRadius: 10,
          pointBackgroundColor: this.colorOfPointsRandom,
          // pointBorderColor: this.colorOfPointsRandom,
          pointStyle: 'circle',
          // backgroundColor: this.colorOfPointsRandom,
          data: distanceData.pointList
        }
      ]
    }


    let chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: 
          [
            {
              gridLines: {
                  display: true,
              },
              scaleLabel: {
                display: true,
                labelString: 'Euclidean distance: Business-Model-Canvas'
              },
              ticks: {
                beginAtZero: true,
                stepValue: 0.5,
                max: 10
              }
            }
          ],
        yAxes: 
          [
            {
              gridLines: {
                display: true,
              },
              scaleLabel: {
                display: true,
                labelString: 'Euclidean distance: Strategy'
              },
              ticks: {
                beginAtZero: true,
                max: 5
              }
            }
          ]
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
            fontColor: 'rgb(0,0,0)',
            usePointStyle: true,
        }
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 0
        },
      },
      tooltips: {
        callbacks: {
           label: function(tooltipItem, data) {
              var label = data.labels[tooltipItem.index];
              return "Pattern: " + label + ': (x=Distance Pattern: ' + tooltipItem.xLabel + ', y=Distance Strategy: ' + tooltipItem.yLabel + ')';
           }
        }
    },
    annotation: {
        annotations: [
              {
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-1',
                value: 3.0,
                borderColor: "rgba(60,60,200,0.25)",
                borderWidth: 2,
            },
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y-axis-1',
              value: 3.0,
              borderColor: "rgba(60,60,200,0.25)",
              borderWidth: 2,
          },
          {
            type: "box",
            drawTime: "beforeDatasetsDraw",
            id: 'a-box-1',
            xScaleID: 'x-axis-1',
            yScaleID: 'y-axis-1',
            xMin: 0,
            xMax: 2,
            yMax: 2,
            yMin:  0,
            borderColor: "rgba(60,60,200,0.0)",
            borderWidth: 0,
            backgroundColor: "rgba(60,60,200,0.10)",
          },
          {
            type: "box",
            drawTime: "beforeDatasetsDraw",
            id: 'a-box-2',
            xScaleID: 'x-axis-1',
            yScaleID: 'y-axis-1',
            xMin: 0,
            xMax: 3.5,
            yMax: 3.5,
            yMin:  0,
            borderColor: "rgba(60,60,200,0.0)",
            borderWidth: 0,
            backgroundColor: "rgba(60,60,200,0.10)",
          },
          {
            type: "box",
            drawTime: "beforeDatasetsDraw",
            id: 'a-box-3',
            xScaleID: 'x-axis-1',
            yScaleID: 'y-axis-1',
            xMin: 0,
            xMax: 10,
            yMax: 10,
            yMin:  0,
            borderColor: "rgba(60,60,200,0.0)",
            borderWidth: 0,
            backgroundColor: "rgba(60,60,200,0.10)",
          }
        ]
    }
  }
    this.chart = new Chart(ctx, { type: chartType, data: chartData, options: chartOptions });
  }
}