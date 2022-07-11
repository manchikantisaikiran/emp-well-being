import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { KeyString, KeyArray } from '@interface';
import { ToastService } from 'angular-toastify';
import { BehaviorSubject, takeWhile } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { UtilsService } from 'src/app/services/utils.service';

declare var Plotly: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  alive = true;
  chartMetaData: any;

  chartData: any;
  Loading$ = new BehaviorSubject(true);
  constructor(private api: ApiService,
    private toaster: ToastService,
    private utils: UtilsService) { }

  ngOnInit(): void {
    this.getCSVData();
  }

  ngAfterViewInit() {
  }

  getCSVData() {
    this.api.getCSVData().pipe(takeWhile(_ => this.alive)).subscribe({
      next: (res) => {
        this.chartMetaData = this.CSVtoJSON(res);
        this.prepareChartData();
      },
      error: (err) => {
        console.log(err);
        this.toaster.error(err.error.message);
        if(err.status == 401){
          //token expired or invalid
          //redirecting user to login
          this.utils.currentUser$.next(null);
          this.utils.removeLocalStroage('currentUser');
        }
      }
    })
  }

  CSVtoJSON(csv: any) {
    const rows = csv.split("\n");

    const result = [];
    const headers: Array<any> = rows[0].split(",");

    for (let i = 1; i < rows.length; i++) {
      const obj: KeyString = {};
      const currentline = rows[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        obj[key] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }

  prepareChartData() {
    const shipModeChart: KeyString = {};
    const regionSalesChart: KeyString = {};
    const monthlySalesChart: KeyString = {};
    const ProfitabilityChart: KeyString = {};
    const categoryChart: KeyArray = {};

    for (let i = 0; i < this.chartMetaData.length; i++) {

      const obj = this.chartMetaData[i];

      // ignoring quantity which is not in correct format
      if (!isNaN(obj.Quantity)) {
        if (shipModeChart[obj['Ship Mode']]) {
          shipModeChart[obj['Ship Mode']] = Number(shipModeChart[obj['Ship Mode']]) + (+obj.Quantity);
        } else {
          shipModeChart[obj['Ship Mode']] = (+obj.Quantity);
        }
      }

      //ignoring the sales which is not in correct format
      if (!isNaN(obj.Sales)) {
        //data for regional sales chart
        if (regionSalesChart[obj.Region]) {
          regionSalesChart[obj.Region] = Number(regionSalesChart[obj.Region]) + (+obj.Sales);
        } else {
          regionSalesChart[obj.Region] = (+obj.Sales);
        }

        //data for monthly sales chart 
        const monthAndYearArray = obj['Order Date'].split('/');
        const monthAndYearString = [monthAndYearArray[2], monthAndYearArray[1]].join('-');
        if (monthlySalesChart[monthAndYearString]) {
          monthlySalesChart[monthAndYearString] = Number(monthlySalesChart[monthAndYearString]) + (+obj.Sales);
        } else {
          monthlySalesChart[monthAndYearString] = (+obj.Sales);
        }

      }

      //ignoring the profit which are not in correct format
      if (!isNaN(obj.Profit)) {
        if (ProfitabilityChart[obj.City] != undefined) {
          ProfitabilityChart[obj.City] = Number(ProfitabilityChart[obj.City]) + (+obj.Profit);
        } else {
          ProfitabilityChart[obj.City] = (+obj.Profit);
        }

      }

      if (obj.Category) {
        if (categoryChart[obj.Category]) {
          categoryChart[obj.Category].push(obj['Sub-Category']);
        } else {
          categoryChart[obj.Category] = [obj['Sub-Category']]
        }
      }
    }
    const sortedArray = Object.entries(ProfitabilityChart).sort(([, a], [, b]) => +a - +b)

    this.chartData = {
      ...this.chartData, shipModeChart, regionSalesChart, monthlySalesChart, categoryChart,
      topProfitable: sortedArray.slice(-10),
      leastProfitable: sortedArray.slice(0, 10)
    };

    this.plotRegionSalesBarGraph();
    this.plotShipModePieChart();
    this.plotCategoryPieChart();
    this.plotSalesByMonthGraph();

    this.plotTopProfitableCities();
    this.plotLeastProfitableCities();
    this.Loading$.next(false);
  }

  plotShipModePieChart() {
    var data = [{
      values: Object.values(this.chartData.shipModeChart),
      labels: Object.keys(this.chartData.shipModeChart),
      type: 'pie'
    }];

    var layout = {
      height: 400,
      width: 400,
      title: "Sales based on ship mode",
      xaxis:{
        title: 'Region'
      },
      yaxis:{
        title: 'Sales'
      }
    };

    Plotly.newPlot('ship-mode-pie', data, layout);
  }

  plotCategoryPieChart() {
    // this.initialCategoryPieChart.values
    const data = [
      {
        values: Object.values(this.chartData.categoryChart).map((arr: any) => arr.length),
        labels: Object.keys(this.chartData.categoryChart),
        type: 'pie',
      }
    ];


    const layout = {
      height: 400,
      width: 400,
      title: "Categories"
    };

    Plotly.newPlot('category-pie', data, layout);

    const myPlot: any = document.getElementById('category-pie');

    //tried to implement click functionality on pe charts but not completely done
    myPlot.on('plotly_click', (data: any) => {
      const subCategories = this.chartData.categoryChart[data.points[0].label];

      const chartData = [{
        // values: subCategories,
        // labels: subCategories,
        values: ['Labels', 'abcd', 'defg'],
        labels: [1, 2, 4],
        type: 'pie'
      }];

      const layout = {
        height: 400,
        width: 400,
        title: "SUb Categories"
      };
      Plotly.relayout('category-pie', chartData, layout);
    });
  }

  plotRegionSalesBarGraph() {

    var data = [{
      x: Object.keys(this.chartData.regionSalesChart),
      y: Object.values(this.chartData.regionSalesChart),
      type: 'bar'
    }];

    var layout = {
      barmode: 'stack',
      title: 'Sales based on Region',
    };

    Plotly.newPlot('region-sales', data, layout);
  }

  plotSalesByMonthGraph() {
    var data = [{
      x: Object.keys(this.chartData.monthlySalesChart),
      y: Object.values(this.chartData.monthlySalesChart),
      type: 'bar',
    }];

    var layout = {
      title: 'Sales generated in a Month',
      barmode: 'stack',
      xaxis: {
        type: "date",
        title: 'Month'
      },
      yaxis:{
        title: 'sales'
      }
    };

    Plotly.newPlot('monthly-sales', data, layout);
  }

  plotTopProfitableCities() {
    var data = [{
      x: this.chartData.topProfitable.map((arr: any) => arr[0]),
      y: this.chartData.topProfitable.map((arr: any) => arr[1]),
      type: 'bar',
    }];

    var layout = {
      title: 'Top Profitable Companies',
      barmode: 'stack',
      xaxis: {
        title: 'Cities'
      },
      yaxis: {
        title: 'Profits/Losses'
      }
    };

    Plotly.newPlot('high__profits', data, layout);
  }

  plotLeastProfitableCities() {
    var data = [{
      x: this.chartData.leastProfitable.map((arr: any) => arr[0]),
      y: this.chartData.leastProfitable.map((arr: any) => arr[1]),
      type: 'bar',
    }];

    var layout = {
      title: 'Least Profitable Companies',
      barmode: 'stack',
      xaxis: {
        title: 'Cities'
      },
      yaxis: {
        title: 'Profits/Losses'
      }
    };

    Plotly.newPlot('least__profits', data, layout);
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
