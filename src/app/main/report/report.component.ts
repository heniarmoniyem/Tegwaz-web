import { MemoryService } from './../../services/memory.service';
import {
  AuditService,
  auditInterface,
  reportInterface,
  tripInterface,
} from './../../services/audit.service';
import { Component, OnInit } from '@angular/core';
import { Chart } from '@antv/g2';
import { Router } from '@angular/router';

interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}

interface shareInterface {
  companyName: string;
  share: number;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  checked = false;
  auditReport: auditInterface[] = [];
  branchReport: reportInterface[];
  isVisible = false;
  isTripVisible = false;
  isShareVisible = false;
  isShareKeyValue = '';
  shareList: shareInterface[] = [];
  tripList: tripInterface[] = [];
  // myChart: Chart;
  role: string;

  drawGraph(id: string, tripReport: reportInterface[]) {
    const totalTicket =
      tripReport[0].passengerNo +
      tripReport[1].passengerNo +
      tripReport[2].passengerNo;
    console.log(totalTicket);
    if (totalTicket) {
      console.log('object callsed');
      const data = [
        {
          item: tripReport[0].label,
          count: tripReport[0].passengerNo,
          percent: tripReport[0].passengerNo / totalTicket,
        },
        {
          item: tripReport[1].label,
          count: tripReport[1].passengerNo,
          percent: tripReport[1].passengerNo / totalTicket,
        },
        {
          item: tripReport[2].label,
          count: tripReport[2].passengerNo,
          percent: tripReport[2].passengerNo / totalTicket,
        },
      ];
      // if (chart) {
      //   console.log(chart);
      //   // chart.destroy();
      // } else {
      // }
      const chart = new Chart({
        container: id,
        autoFit: true,
        height: 200,
      });

      chart.data(data);
      chart.scale('percent', {
        formatter: (val) => {
          val = val * 100 + '%';
          return val;
        },
      });
      chart.coordinate('theta', {
        radius: 0.75,
        innerRadius: 0.6,
      });
      chart.tooltip({
        showTitle: false,
        showMarkers: false,
        itemTpl:
          '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
      });

      chart
        .annotation()
        .text({
          position: ['50%', '50%'],
          content: totalTicket,
          style: {
            fontWeight: 'bolder',
            fontSize: 16,
            fill: '#8c8c8c',
            textAlign: 'center',
          },
          offsetY: -20,
        })
        .text({
          position: ['50%', '50%'],
          content: 'Tickets',
          style: {
            fontSize: 14,
            fill: '#8c8c8c',
            textAlign: 'center',
          },
        })

        .text({
          position: ['50%', '50%'],
          content: 'Sold',
          style: {
            fontSize: 14,
            fill: '#8c8c8c',
            textAlign: 'center',
          },
          offsetY: 20,
          // offsetX: 20,
        });
      chart
        .interval()
        .adjust('stack')
        .position('percent')
        .color('item')
        .label('percent', (percent) => {
          return {
            content: (data) => {
              return `${data.item}: ${percent * 100}%`;
            },
          };
        })
        .tooltip('item*percent', (item, percent) => {
          percent = percent * 100 + '%';
          return {
            name: item,
            value: percent,
          };
        });

      chart.interaction('element-active');

      chart.render();
    }
  }

  updateStatus(tripId: string) {
    // ! hide the column
  }

  hideModal() {
    this.isVisible = false;
    this.isTripVisible = false;
    this.branchReport = [];
    this.tripList = [];
  }

  displayBranchAuditReport(tripId: string) {
    this.isVisible = true;
    this.branchReport = this.auditService.auditBranch(tripId);
  }

  calculateShare(tripId: string, index: number) {
    this.isShareVisible = !this.isShareVisible;
    if (this.isShareVisible) {
      this.isShareKeyValue = tripId;
      this.shareList = [];
      let totalAmount = 0;
      let appPassengersNo = 0;
      this.auditReport[index].tripReport.forEach((audRep) => {
        totalAmount += audRep.amount;
        if (audRep.label == 'Application') {
          appPassengersNo = audRep.passengerNo;
        }
      });
      this.auditService.fetchCompanyName(tripId).then((response) => {
        this.shareList.push({
          companyName: 'Teguaze Co.Ltd.',
          share: appPassengersNo * 50,
        });

        this.shareList.push({
          companyName: response.val(),
          share: totalAmount - appPassengersNo * 50,
        });
      });
    }
  }

  displayTripDetail(tripId: string) {
    this.tripList = this.auditService.fetchTripDetail(tripId);
    this.isTripVisible = true;
  }

  constructor(
    private auditService: AuditService,
    private memory: MemoryService,
    private routes: Router // private memory: MemoryService
  ) {}

  ngOnInit(): void {
    const role =
      this.memory.getRole() == 'Admin' ||
      this.memory.getRole() == 'Super Admin';
    if (!role) {
      this.routes.navigate(['../page-not-found']);
    }
    this.role = this.memory.getRole();
    // this.auditReport = [];
    this.auditService.auditReportList.subscribe((response) => {
      response.forEach((aud) => {
        this.auditReport = response;
      });

      // setTimeout(() => {
      //   this.auditReport.forEach((res) =>
      //     this.drawGraph(res.tripKey, res.tripReport)
      //   );
      // }, 3000);
    });

    // service auditor method calling
    this.auditService.setTrips();
  }
}
