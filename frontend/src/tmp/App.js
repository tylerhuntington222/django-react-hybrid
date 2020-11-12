import React from 'react';
import ReactDOM from 'react-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Jumbotron from 'react-bootstrap/Jumbotron';
import InputGroup from 'react-bootstrap/InputGroup';
import ReactHtmlParser from 'react-html-parser';
import {ResponsiveBar} from "@nivo/bar";
import {ResponsivePie} from '@nivo/pie'
import {ResponsiveSunburst} from '@nivo/sunburst'
import {BsArrowRight} from 'react-icons/bs';
import {BsInfoCircle} from 'react-icons/bs';
import axios from 'axios';

const microbHosts = JSON.parse(
  document.getElementById('microb-hosts').textContent
);

class App extends React.Component {
  constructor(props) {
    const defaultSelectedProduct = 'Ethanol'
    const defaultUnitCostsUnits = 'gal'
    super(props)
    this.state = {
      selectedProduct: defaultSelectedProduct,
      msps: {
        'kg': null,
        'gal': null,
        'l': null
      },
      unitCostsUnits: defaultUnitCostsUnits,
      productName: defaultSelectedProduct,
      inputParamsSectionDisplay: 'none',
      findSepStratBtnDisplay: 'none',
      resultsSectionDisplay: 'none',
      processParams: null,
      prodMicrobProps: null,
      costs: null,
      inputParamsFormValidated: false
    }
    // this.handleProdAccumBtnClick = this.handleProdAccumBtnClick.bind(this)
    this.handleProdSelectChange = this.handleProdSelectChange.bind(this)
    this.handleUnitCostsSelectChange =
      this.handleUnitCostsSelectChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleProdSelectNextBtnClick =
      this.handleProdSelectNextBtnClick.bind(this)
    // this.handleSolubilityBtnClick = this.handleSolubilityBtnClick.bind(this)
    this.handleFindSepStratBtnClick = this.handleFindSepStratBtnClick.bind(this)
    this.handleDownloadResultsBtnClick = this.handleDownloadResultsBtnClick.bind(this)
    this.handleCustomProdInputChange = this.handleCustomProdInputChange.bind(this)
  }

  handleProdSelectChange(event) {
    this.setState({
      inputParamsFormValidated: false
    })
    const selectedProduct = event.target.value;
    var unitCostsUnits
    if (selectedProduct === 'Indigoidine') {
      unitCostsUnits = 'kg'
    } else {
      unitCostsUnits = 'gal'
    }
    this.setState(
      {
        selectedProduct: selectedProduct,
        productName: selectedProduct,
        unitCostsUnits: unitCostsUnits,
        inputParamsSectionDisplay: 'none',
        resultsSectionDisplay: 'none',
        prodMicrobProps: null,
        processParams: null,
        findSepStratBtnDisplay: 'none',
      }
    )
  }

  handleUnitCostsSelectChange(event) {
    this.setState(
      {
        unitCostsUnits: event.target.value,
      }
    )
  }

  handleInputChange(event) {
    var val = event.target.value;
    var param = event.target.getAttribute('param');
    var prodMicrobProps = this.state.prodMicrobProps;
    var processParams = this.state.processParams;
    if (event.target.getAttribute('ui_percentage')) {
      val /= 100;
    }
    if (this.state.prodMicrobProps.hasOwnProperty(param)) {
      prodMicrobProps[param] = val;
    } else if (this.state.processParams.hasOwnProperty(param)) {
      processParams[param] = val;
    }
    // handle special case of microbial host select so that it is coupled with
    // host diameter input
    if (param === 'microbial_host') {
      if (microbHosts[val]) {
        prodMicrobProps['microbial_diameter'] = parseFloat(
          microbHosts[val].Diameter
        )
      } else {
        prodMicrobProps['microbial_diameter'] = ''
      }
    }
    // // handle special case of microbial host diameter input change
    // // so that it is coupled with host name select
    // if (param === 'microbial_diameter') {
    //   prodMicrobProps['microbial_host'] = 'Other'
    // }
    this.setState(
      {
        processParams: processParams,
        prodMicrobProps: prodMicrobProps,
        findSepStratBtnDisplay: 'block',
        resultsSectionDisplay: 'none',
      }
    )
  }

  handleCustomProdInputChange(event) {
    const product = event.target.value;
    this.setState(
      {
        productName: product
      }
    )
    if (event.key === 'Enter') {
      this.handleProdSelectNextBtnClick(event)
    }
  }

  // handleSolubilityBtnClick(event) {
  //   const prodMicrobProps = this.state.prodMicrobProps;
  //   const sol = event.target.value;
  //   prodMicrobProps.soluble_in_water = sol
  //   this.setState(
  //     {
  //       prodMicrobProps: prodMicrobProps
  //     }
  //   )
  // };

  handleFindSepStratBtnClick(event) {
    event.preventDefault();
    // event.target.className += "was-validated";
    this.setState({
      inputParamsFormValidated: true
    })
    const form = event.currentTarget;
    // first validate 'standard' (i.e. non binary button) inputs of the form
    if (form.checkValidity() === false) {
      alert('Please fill out the required input fields.')
      this.setState({
        resultsSectionDisplay: 'none',
      })
      return
    }
    //next, validate binary button inputs of the form
    const params = {...this.state.prodMicrobProps, ...this.state.processParams}
    const btn_inputs = [
      'soluble_in_water',
      'crystallizable',
      'position_in_cell',
    ]
    // btn_inputs.forEach(function (i) {
    for (let i of btn_inputs) {
      //omit the record with totals used for rendering last row in cost table
      if (params[i] === '') {
        alert('Please fill out the required input fields.')
        this.setState({
          resultsSectionDisplay: 'none',
        })
        return
      }
    }

    axios.get(
      `${this.state.productName}`, {
        params: params
      }
    ).then(
      res => {
        var data = JSON.parse(res.data)
        // const msps = {
        //   'kg': data._msp_per_kg,
        //   'gal': data._msp_per_gal,
        //   'l': data._msp_per_l,
        // }
        const msps = data.msps;
        const productAmt = data.tot_prod_amt[data.default_prod_units]

        this.setState({
          findSepStratBtnDisplay: 'none',
          costs: data.gross_costs,
          productAmt: numWithCommas(productAmt, 0),
          productAmtUnits: data.default_prod_units,
          msps: msps,
          prodMicrobProps: data.prod_microb_props,
          processParams: data.process_params,
          inputParamsSectionDisplay: 'block',
          resultsSectionDisplay: 'block'
        })
      }
    )
  }

  handleDownloadResultsBtnClick() {
    const params = {...this.state.prodMicrobProps, ...this.state.processParams}
    const FileDownload = require('js-file-download');
    const prod = this.state.productName

    axios.get(
      `download/${prod}`, {
        params: params
      })
      .then(
        (response) => {
          FileDownload(response.data, `separation_strategy_${prod}.json`);
        }
      )
  };

  handleProdSelectNextBtnClick(event) {
    event.preventDefault()
    // this.setState({
    //   inputParamsFormValidated: false
    // })
    axios.get(
      `load_default_params/${this.state.productName}`,
    ).then(res => {
        var data = JSON.parse(res.data)
        this.setState({
          costs: data.gross_costs,
          prodMicrobProps: data.prod_microb_props,
          processParams: data.process_params,
          inputParamsSectionDisplay: 'block',
          findSepStratBtnDisplay: 'block',
        })
      }
    )
  }

  render() {
    const selectedMsps = this.state.msps[this.state.unitCostsUnits]
    return (
      <Container>
        <Container>
          <br></br>
          <h2>Separations Strategy Decision Tool</h2>
        </Container>
        <hr></hr>
        <SelectEndProductJumbo
          selectedProduct={this.state.selectedProduct}
          prodSelectOnChange={this.handleProdSelectChange}
          nextBtnOnClick={this.handleProdSelectNextBtnClick}
          customProdInputOnChange={this.handleCustomProdInputChange}
        />
        <Form onSubmit={this.handleFindSepStratBtnClick}
              className={
                this.state.inputParamsFormValidated ? "was-validated" : ""
              }
              noValidate
        >
          {this.state.inputParamsSectionDisplay === 'block' &&
          <InputParamsSection
            inputParamsFormValidated={this.state.inputParamsFormValidated}
            display={this.state.inputParamsSectionDisplay}
            prodMicrobProps={this.state.prodMicrobProps}
            processParams={this.state.processParams}
            // prodAccumBtnOnClick={this.handleProdAccumBtnClick}
            // solubilityBtnOnClick={this.handleSolubilityBtnClick}
            inputOnChange={this.handleInputChange}
          />
          }
          {this.state.inputParamsSectionDisplay == 'block' ?
            <Container
              className="d-flex justify-content-center"
              style={{'marginTop': '1%', "marginBottom": "3%"}}
            >
              <Button
                type="submit"
                className="text-center"
                variant="primary"
                style={{display: this.state.findSepStratBtnDisplay}}
              >
                Find Separation Strategy
              </Button>
            </Container>
            : null
          }
        </Form>
        {this.state.resultsSectionDisplay === 'block' &&
        <Container>
          <ProcessConfigSection
            display={this.state.inputParamsSectionDisplay}
            costs={this.state.costs}
            prodMicrobProps={this.state.prodMicrobProps}
            processParams={this.state.processParams}
            inputOnChange={this.handleInputChange}
            recomputeBtnOnClick={this.handleFindSepStratBtnClick}
            // unitCosts={selectedUnitCosts}
            msps={selectedMsps}
            unitCostsUnits={this.state.unitCostsUnits}
            unitCostsUnitsSelOnChange={this.handleUnitCostsSelectChange}
            productName={this.state.productName}
            productAmt={this.state.productAmt}
            productAmtUnits={this.state.productAmtUnits}
          />
        </Container>
        }
        {this.state.resultsSectionDisplay === 'block' ?
          <CostAnalysisSection
            display={this.state.resultsSectionDisplay}
            prodMicrobProps={this.state.prodMicrobProps}
            processParams={this.state.processParams}
            costs={this.state.costs}
            downloadResultsBtnOnClick={this.handleDownloadResultsBtnClick}
          />
          : null}
      </Container>

    );
  }
}

class InputParamsSection extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Container style={{"display": this.props.display}}>
        <Container className="text-center">
          <h4>Product Specifications & Microbe Properties</h4>
          <hr></hr>
        </Container>
        <Row className="d-flex justify-content-between">
          <ProductSpecsCard
            inputParamsFormValidated={this.props.inputParamsFormValidated}
            prodMicrobProps={this.props.prodMicrobProps}
            processParams={this.props.processParams}
            // prodAccumBtnOnClick={this.props.prodAccumBtnOnClick}
            // solubilityBtnOnClick={this.props.solubilityBtnOnClick}
            inputOnChange={this.props.inputOnChange}
          />
          <MicrobePropsCard
            prodMicrobProps={this.props.prodMicrobProps}
            processParams={this.props.processParams}
            inputOnChange={this.props.inputOnChange}
          />
        </Row>
        <Container className="text-center">
          <h4>Process Parameters</h4>
          <hr></hr>
        </Container>
        <Row className="d-flex justify-content-between">
          <UpstreamProcessParamsCard
            inputParamsFormValidated={this.props.inputParamsFormValidated}
            prodMicrobProps={this.props.prodMicrobProps}
            processParams={this.props.processParams}
            inputOnChange={this.props.inputOnChange}
            inputWidth={'90%'}
          />
          <RecoveryProcessParamsCard
            inputParamsFormValidated={this.props.inputParamsFormValidated}
            prodMicrobProps={this.props.prodMicrobProps}
            processParams={this.props.processParams}
            inputOnChange={this.props.inputOnChange}
          />
        </Row>
      </Container>
    )
  }
}

class ProcessConfigSection extends React.Component {
  constructor(props) {
    super(props)
  }


  makeCostTableData(costs) {
    const costTableData = []
    var tot_capex = 0;
    var tot_consum_cost = 0;
    var tot_energy_cost = 0;
    var tot_material_cost = 0;
    var tot_opex = 0;
    var tot_equip_purch_cost = 0;

    // Object.values(costs).forEach(function (unit_op) {
    //   Object.values(unit_op).forEach(function (equip) {
    Object.keys(costs).forEach(function (equip) {
      var equip_costs = costs[equip];
      equip_costs['equip_name'] = equip
      tot_equip_purch_cost += equip_costs.CAPEX_itemized
        .fixed_capital_cost_itemized.direct_cost_itemized.equip_purch_cost
      tot_capex += equip_costs.CAPEX_total
      equip_costs['Consumable cost'] =
        equip_costs['OPEX_itemized']['Consumable cost']
      tot_consum_cost +=
        parseFloat(equip_costs['OPEX_itemized']['Consumable cost'])
      equip_costs['Material cost'] =
        equip_costs['OPEX_itemized']['Material cost']
      tot_material_cost +=
        parseFloat(equip_costs['OPEX_itemized']['Material cost'])
      equip_costs['Energy cost'] =
        equip_costs['OPEX_itemized']['Energy cost']
      tot_energy_cost +=
        parseFloat(equip_costs['OPEX_itemized']['Energy cost'])
      tot_opex += equip_costs['OPEX_total']
      costTableData.push(equip_costs)
    })
    //   })
    // })
    costTableData.push(
      {
        'equip_name': 'Totals',
        'CAPEX_total': tot_capex,
        'Consumable cost': tot_consum_cost,
        'Material cost': tot_material_cost,
        'Energy cost': tot_energy_cost,
        'OPEX_total': tot_opex,
        'tot_equip_purch_cost': tot_equip_purch_cost
      }
    )
    return (costTableData)
  }

  renderEquipCostTableRows(costs) {
    // set number of decimal places to include in cost values
    const dec = 0;
    const costTableData = this.makeCostTableData(costs)
    const equipCostsTableRows = costTableData.map(
      (rec, i) => {
        let className = 'text-right';
        let style = {};
        var purch_cost;
        const install_cost_fac = 1.7;
        if (rec.equip_name === 'Totals') {
          className = 'text-right table-dark';
          style = {color: '#000000', fontWeight: 'bold'}
          purch_cost = rec.tot_equip_purch_cost
        } else {
          purch_cost = rec.CAPEX_itemized
            .fixed_capital_cost_itemized.direct_cost_itemized.equip_purch_cost
        }
        return (
          <tr key={i} className={className} style={style}>
            <td className='text-left'>{rec.equip_name}</td>
            {/*<td>$500</td>*/}
            <td>{
              numWithCommasUSD((purch_cost * install_cost_fac).toFixed(dec))
            }</td>
            <td>{numWithCommasUSD(rec.CAPEX_total.toFixed(dec))}</td>
            <td>{numWithCommasUSD(rec['Material cost'].toFixed(dec))}</td>
            <td>{numWithCommasUSD(rec['Energy cost'].toFixed(dec))}</td>
            <td>{numWithCommasUSD(rec['Consumable cost'].toFixed(dec))}</td>
            <td>{numWithCommasUSD(rec.OPEX_total.toFixed(dec))}</td>
            {/*<td>{numWithCommasUSD(rec['Total cost'].toFixed(dec))}</td>*/}
          </tr>
        )
      }
    );
    return equipCostsTableRows
  }

  renderEquipCostTable(costs) {
    return (
      <Table className='table-striped'>
        {/*<colgroup>*/}
        {/*  <col></col>*/}
        {/*  <col></col>*/}
        {/*  <col></col>*/}
        {/*  <col></col>*/}
        {/*  <col></col>*/}
        {/*  <col></col>*/}
        {/*  <col span="1" className="table-secondary"></col>*/}
        {/*</colgroup>*/}
        <thead>
        <tr>
          <th rowSpan="2">Equipment</th>
          <th rowSpan="2" className="text-right">Installed Cost</th>
          <th rowSpan="2" className="text-right">CAPEX</th>
          <th colSpan="3" className="text-center">OPEX</th>
          <th rowSpan="2" className="text-right">Total OPEX</th>
        </tr>
        <tr>
          <th className="text-right">Materials</th>
          <th className="text-right">Energy</th>
          <th className="text-right">Consumables</th>
        </tr>
        </thead>
        <tbody>
        {this.renderEquipCostTableRows(costs)}
        </tbody>
      </Table>
    )
  }

  makeCostPieChartData(costs, type) {
    var data = []
    const cost_recs = this.makeCostTableData(costs)

    cost_recs.pop('Totals')
    cost_recs.forEach(function (rec) {
      //omit the record with totals used for rendering last row in cost table
      if (rec.equip_name !== 'Totals') {
        var item = {
          'id': rec.equip_name,
          'label': rec.equip_name,
          'value': parseFloat(rec[`${type}_total`].toFixed(2))
        }
        data.push(item)
      }
    })
    return (data)
  }

  makeMspPieChartData(costs) {
    var data = []
    const cost_recs = this.makeCostTableData(costs)

    cost_recs.pop('Totals')
    const types = ['CAPEX', 'OPEX']
    // for (var type of types) {
    cost_recs.forEach(function (rec) {
      //omit the record with totals used for rendering last row in cost table
      if (rec.equip_name !== 'Totals') {
        var val = parseFloat(rec['CAPEX_total'])
          + parseFloat(rec['OPEX_total'])
        val = parseFloat(val.toFixed(2))
        var item = {
          'id': `${rec.equip_name}`,
          'label': `${rec.equip_name}`,
          // 'label': rec.equip_name,
          'value': val
        }
        data.push(item)
      }
    })
    // }
    return (data)
  }

  makeCapexPieChartData(costs) {
    return this.makeCostPieChartData(costs, 'CAPEX')
  }

  makeOpexPieChartData(costs) {
    return this.makeCostPieChartData(costs, 'OPEX')
  }


  renderCapexPieChart(costs) {
    const data = this.makeCapexPieChartData(costs)
    return this.renderEquipCostPieChart(data)
  }

  renderOpexPieChart(costs) {
    const data = this.makeOpexPieChartData(costs)
    return this.renderEquipCostPieChart(data)
  }

  renderMspPieChart(costs) {
    const data = this.makeMspPieChartData(costs)
    return this.renderEquipCostPieChart(data)
  }

  renderEquipCostPieChart(data) {
    const margin = {top: 0, right: 140, bottom: 0, left: 170}
    return (
      <ResponsivePie
        data={data}
        margin={margin}
        pixelRatio={2}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{scheme: 'category10'}}
        borderColor={{from: 'color', modifiers: [['darker', 0.6]]}}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={-5}
        radialLabelsLinkDiagonalLength={30}
        radialLabelsLinkHorizontalLength={10}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{from: 'color'}}
        slicesLabelsSkipAngle={20}
        slicesLabelsTextColor="#000000"
        slicesLabelsTextSize={20}
        sliceLabel={
          function (e) {
            return numWithCommasUSD(e.value, 2)
          }
        }
        tooltipFormat={
          value => numWithCommasUSD(value, 2)
        }
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        // legends={[
        //   {
        //     anchor: 'right',
        //     direction: 'column',
        //     translateX: 300,
        //     itemWidth: 60,
        //     itemHeight: 14,
        //     itemsSpacing: 2,
        //     symbolSize: 14,
        //     symbolShape: 'circle'
        //   }
        // ]}
      />
    )

  }

  renderEquipFlowchart(costs, productName, productAmt, productAmtUnits) {
    // accumulate names of equipment units
    const equip = [];
    Object.keys(costs).forEach(function (equip_unit) {
      // Object.values(process).forEach(function (unit_op) {
      //   Object.keys(unit_op).forEach(function (equip_unit) {
      equip.push(equip_unit)
      //     }
      //   )
      // });
    });
    equip.push(productName)
    // build flowchart
    const equipFlowchart = equip.map(
      (equip_unit, i) => {
        const imgFilename = `${equip_unit.replace(/ /g, '')}.png`;
        const imgURL = `/static/frontend/equip_symbols/${imgFilename}`;
        return (
          <Row
            key={i}
            style={{margin: 0, padding: 0}}
          >
            {i < (equip.length - 1) ?
              <Col
                style={{margin: 0, padding: 0}}
              >
                <Row
                  className='d-flex justify-content-center flex-column align-items-center'
                  style={{height: '120px', margin: 0, padding: 0}}
                >
                  <div
                    className='d-flex flex-column justify-content-center align-items-center'
                  >
                    <img src={imgURL}
                         style={{width: '95%'}}
                    ></img>
                  </div>
                </Row>
                <Row
                  className='d-flex text-center justify-content-center'
                >
                  <div
                    style={{width: '110px'}}
                  >
                    <p>{equip_unit}</p>
                  </div>
                </Row>
              </Col>
              : null}
            <div
              style={{width: '30px', margin: 0, padding: 0}}
            >
              {i < (equip.length - 1) ?
                <Row
                  className='d-flex flex-column justify-content-center align-items-center'
                  style={{
                    height: '120px',
                    marginRight: '-20px',
                    marginLeft: '-20px',
                    padding: 0
                  }}
                >
                  <BsArrowRight size={30}/>
                </Row>
                :
                <Row
                  className='d-flex flex-column justify-content-center align-items-center'
                  style={{height: '120px', margin: 0, padding: 0}}
                >
                  <Card
                    style={{
                      marginLeft: '8px',
                      height: "auto",
                      padding: 2,
                      width: '100px'
                    }}>
                    <strong
                      className='d-flex flex-column justify-content-center align-items-center'
                    >
                      {productName}
                    </strong>
                    <small className="text-center">
                      Total Product:
                    </small>
                    <small className="text-center">
                      {productAmt} {productAmtUnits}
                    </small>
                  </Card>
                </Row>
              }
              <Row>
                <div className='d-flex text-center justify-content-center'>
                  <p></p>
                </div>
              </Row>
            </div>
          </Row>
        )
      }
    )
    return equipFlowchart
  }


  render() {
    const margin = {top: 0, right: 140, bottom: 0, left: 170}
    const styles = {
      root: {
        textAlign: "center",
        position: "relative",
        width: 500,
      },
      overlay: {
        position: "absolute",
        top: 0,
        right: margin.right,
        bottom: 0,
        left: margin.left,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
        color: '#000000',
        // background: "#FFFFFF33",
        textAlign: "center",
        // This is important to preserve the chart interactivity
        pointerEvents: "none"
      },
      totalLabel: {
        fontSize: 14
      },
      totalVal: {
        fontSize: 20
      }
    }
    const flatCostArray = this.makeCostTableData(this.props.msps)
    flatCostArray.pop('Totals')
    var totalCapex = 0
    var totalOpex = 0
    var totalMsp = 0
    flatCostArray.forEach(function (equip_rec) {
      totalCapex += equip_rec['CAPEX_total']
      totalOpex += equip_rec['OPEX_total']
    })
    var totalMsp = totalCapex + totalOpex

    return (
      <div>
        <Row>
          <Col className='text-center'>
            <h4>Equipment Configuration & Costs</h4>
            <hr></hr>
          </Col>
        </Row>
        <Row
          className='d-flex flex-column align-items-center'
          style={{marginLeft: '-20px', padding: 0}}
        >
          <Row
          >
            {this.props.costs !== [] ?
              this.renderEquipFlowchart(
                this.props.costs, this.props.productName, this.props.productAmt,
                this.props.productAmtUnits
              ) : ''
            }
          </Row>
        </Row>
        <Row>
          {this.renderEquipCostTable(this.props.costs)}
        </Row>
        <h4 className='text-center' style={{marginTop: '20px'}}>
          Minimum Selling Price Analysis
        </h4>
        <Card
          className='d-flex justify-content-center align-items-center'
          style={
            {
              "padding": 0
            }
          }
        >
          <Form.Group>
            <div style={{textAlign: 'center', marginTop: '10px'}}>
              <Form.Label style={{fontSize: '20px', marginRight: '7px'}}>
                Units:
              </Form.Label>
              <Form.Control
                required
                as="select"
                size="md"
                custom
                style={{width: "auto", height: '36px'}}
                defaultValue={this.props.unitCostsUnits}
                onChange={this.props.unitCostsUnitsSelOnChange}
              >
                <option value='gal'>$/gal</option>
                <option value='l'>$/liter</option>
                <option value='kg'>$/kg</option>
              </Form.Control>
            </div>
          </Form.Group>
          {/*    <Row>*/}
          {/*      <Col style={{ height: '300px', margin: 0}}>*/}
          {/*        <h5 style={{textAlign: 'center', marginLeft:'30px'}}>CAPEX</h5>*/}
          {/*        <div*/}
          {/*          style={styles.root}*/}
          {/*        >*/}
          {/*          {this.renderCapexPieChart(this.props.msps)}*/}
          {/*          <div style={styles.overlay}>*/}
          {/*    <span style={styles.totalLabel}>*/}
          {/*      <strong>MSP</strong>*/}
          {/*</span>*/}
          {/*            <span style={styles.totalVal}>*/}
          {/*      <strong>*/}
          {/*        {numWithCommasUSD(totalCapex.toFixed(2))}*/}
          {/*      </strong>*/}
          {/*</span>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </Col>*/}
          {/*      <Col style={{ height: '300px', margin: 0}}>*/}
          {/*        <h5 style={{textAlign: 'center', marginLeft:'30px'}}>OPEX</h5>*/}
          {/*        <div*/}
          {/*          style={styles.root}*/}
          {/*        >*/}
          {/*          {this.renderOpexPieChart(this.props.msps)}*/}
          {/*          <div style={styles.overlay}>*/}
          {/*    <span style={styles.totalLabel}>*/}
          {/*      <strong>MSP</strong>*/}
          {/*</span>*/}
          {/*            <span style={styles.totalVal}>*/}
          {/*      <strong>*/}
          {/*        {numWithCommasUSD(totalOpex.toFixed(2))}*/}
          {/*      </strong>*/}
          {/*</span>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </Col>*/}
          {/*    </Row>*/}
          <Row>
            <Col style={{height: '300px', margin: 0}}>
              <div
                style={styles.root}
              >
                {this.renderMspPieChart(this.props.msps)}
                <div style={styles.overlay}>
          <span style={styles.totalLabel}>
            <strong>MSP</strong>
      </span>
                  <span style={styles.totalVal}>
            <strong>
              {numWithCommasUSD(totalMsp.toFixed(2))}
            </strong>
      </span>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    )
  }
}

class CostAnalysisSection extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    // const data = this.makePlotData(this.props.costs)
    return (
      <div>
        <div
          className="d-flex justify-content-center"
          style={{'marginTop': '1%', "marginBottom": "3%"}}
        >
          <Button
            className="text-center"
            variant="primary"
            onClick={this.props.downloadResultsBtnOnClick}
          >
            Download Cost Data
          </Button>
        </div>
      </div>
    )
  }
}

class SelectEndProductJumbo extends React.Component {
  constructor(props) {
    super(props)
  }


  render() {
    const {prodSelectOnChange, nextBtnOnClick} = this.props
    return (
      <Jumbotron style={{padding: "2% 3%"}}>
        <Form onSubmit={this.props.nextBtnOnClick}>
          <Row>
            <Col className="col-5" style={{}}>
              <h5>Choose your end-product</h5>
              <Form.Group>
                <Form.Control
                  required
                  as="select"
                  size="md"
                  custom
                  style={{width: "auto"}}
                  defaultValue={this.props.selectedProduct}
                  onChange={prodSelectOnChange}
                >
                  <option>Ethanol</option>
                  <option>Isopentenol</option>
                  <option>Indigoidine</option>
                  <option>Other</option>
                </Form.Control>
                <p style={{"paddingTop": '12px'}}>Select 'other' if product is
                  not listed.</p>
              </Form.Group>
            </Col>
            <Col className="col-5">
              {this.props.selectedProduct === 'Other' &&
              <div>
                <h5>Product Name</h5>
                <Form.Control
                  required
                  type='text'
                  id="custom-product-name-input"
                  onKeyUp={this.props.customProdInputOnChange}
                />
              </div>
              }
            </Col>
          </Row>
          <Row>
            <Col>
              <Button variant="primary"
                      type='submit'
              >
                Next
              </Button>
            </Col>
          </Row>
        </Form>
      </Jumbotron>
    )
  }

}

class BinaryButtonGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: null
    }
  }

  renderLeftBtn(value) {
    switch (value) {
      case this.props.left_label:
        return true
      default:
        return false

    }
  }

  renderRightBtn(value) {
    switch (value) {
      case this.props.right_label:
        return true
      default:
        return false

    }
  }

  render() {
    return (
      <div>
        {/*<Form.Control*/}
        {/*  // required={this.props.required ? true : false}*/}
        {/*  required*/}
        {/*  >*/}
        <h6>
          {ReactHtmlParser(this.props.title)}
        </h6>
        <ButtonGroup
        >
          <Button
            variant="outline-primary"
            value={this.props.left_label}
            onClick={this.props.onClick}
            active={this.renderLeftBtn(this.props.defaultValue)}
            param={this.props.param}
          >
            {this.props.left_label}</Button>
          <Button variant="outline-primary"
                  required={this.props.required}
                  value={this.props.right_label}
                  onClick={this.props.onClick}
                  active={this.renderRightBtn(this.props.defaultValue)}
                  param={this.props.param}
          >
            {this.props.right_label}</Button>
        </ButtonGroup>
        {
          (this.props.defaultValue === null | this.props.defaultValue == "")
          && this.props.formValidated
          && this.props.required
            ?
            <div className="input-group-append invalid-feedback">
              *Required
            </div>
            : null
        }
        {/*</Form.Control>*/}
      </div>
    )
  }
}


class TextInputWithUnits extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const inputWidth = this.props.inputWidth ? this.props.inputWidth : "90%";
    return (
      <div>
        {/*<Form>*/}
        <h6>
          {ReactHtmlParser(this.props.label)}
        </h6>
        <InputGroup
          className="mb-3 input-group-sm"
          style={{width: inputWidth}}>
          <Form.Control
            required={this.props.required ? true : false}
            param={this.props.param}
            ui_percentage={this.props.ui_percentage}
            placeholder={this.props.placeholder}
            defaultValue={this.props.defaultValue}
            onChange={this.props.onChange}
          >
          </Form.Control>
          <InputGroup.Append>
            <InputGroup.Text>
              {ReactHtmlParser(this.props.units)}
            </InputGroup.Text>
          </InputGroup.Append>
          <Form.Control.Feedback type="invalid">
            *Required
          </Form.Control.Feedback>
        </InputGroup>
        {/*</Form>*/}
      </div>
    )
  }
}

class TextInput extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Card.Title>
          {this.props.label}
        </Card.Title>
        <InputGroup className="mb-3" style={{width: "70%"}}>
          <Form.Control
            placeholder={this.props.placeholder}>
            onChange={this.props.onChange}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            *Required
          </Form.Control.Feedback>
        </InputGroup>
      </div>
    )
  }
}

class UpstreamProcessParamsCard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <InputGroupCard width="32%" header="Upstream Process Parameters">
        {/*<TextInputWithUnits*/}
        {/*  label="Biorefinery Size"*/}
        {/*  placeholder="Optional"*/}
        {/*  units="metric ton/d"*/}
        {/*  defaultValue={*/}
        {/*    this.props.processParams.bioref_size ?*/}
        {/*      this.props.processParams.bioref_size : ''*/}
        {/*  }*/}
        {/*  onChange={this.props.inputOnChange}*/}
        {/*  param="bioref_size"*/}
        {/*  inputWidth={this.props.inputWidth}*/}
        {/*/>*/}
        <TextInputWithUnits
          label="Facility Working Time"
          units="hr/yr"
          defaultValue={
            this.props.processParams.working_hrs ?
              this.props.processParams.working_hrs
              : ''
          }
          onChange={this.props.inputOnChange}
          param="working_hrs"
        />
        <TextInputWithUnits
          required={true}
          label="Flow Rate from Fermentation Broth" units="kg/hr" defaultValue={
          this.props.processParams.flowrate ?
            this.props.processParams.flowrate : ''
        }
          onChange={this.props.inputOnChange}
          param="flowrate"
        />
        {/*<TextInputWithUnits*/}
        {/*  label="IL/PT Chemical Loading Rate"*/}
        {/*  placeholder="Optional"*/}
        {/*  units="kg/kg feedstock"*/}
        {/*  defaultValue={*/}
        {/*    this.props.processParams.il_pt_chem_loading_rate ?*/}
        {/*      this.props.processParams.il_pt_chem_loading_rate : ''*/}
        {/*  }*/}
        {/*  onChange={this.props.inputOnChange}*/}
        {/*  param="il_chem_loading_rate"*/}
        {/*  inputWidth={this.props.inputWidth}*/}
        {/*/>*/}
        {/*<TextInputWithUnits*/}
        {/*  label="Neutralization Chemical <br/> Loading Rate"*/}
        {/*  placeholder="Optional"*/}
        {/*  units="kg/kg IL"*/}
        {/*  defaultValue={*/}
        {/*    this.props.processParams.neut_chem_loading_rate ?*/}
        {/*      this.props.processParams.neut_chem_loading_rate : ''*/}
        {/*  }*/}
        {/*  onChange={this.props.inputOnChange}*/}
        {/*  param="neut_chem_loading_rate"*/}
        {/*  inputWidth={this.props.inputWidth}*/}
        {/*/>*/}
        {/*<TextInputWithUnits*/}
        {/*  label="Enzyme Loading Rate"*/}
        {/*  placeholder="Optional"*/}
        {/*  units="mg protein/g glucan"*/}
        {/*  defaultValue={*/}
        {/*    this.props.processParams.enz_loading_rate ?*/}
        {/*      this.props.processParams.enz_loading_rate : ''*/}
        {/*  }*/}
        {/*  onChange={this.props.inputOnChange}*/}
        {/*  param="enz_loading_rate"*/}
        {/*  inputWidth={this.props.inputWidth}*/}
        {/*/>*/}
        {/*<TextInputWithUnits*/}
        {/*  label="Solid Loading Rate for Bioconversion"*/}
        {/*  placeholder="Optional"*/}
        {/*  units="%"*/}
        {/*  defaultValue={*/}
        {/*    this.props.processParams.solid_loading_rate ?*/}
        {/*      this.props.processParams.solid_loading_rate : ''*/}
        {/*  }*/}
        {/*  onChange={this.props.inputOnChange}*/}
        {/*  param="solid_loading_rate"*/}
        {/*  inputWidth={this.props.inputWidth}*/}
        {/*/>*/}
      </InputGroupCard>
    )
  }
};

class RecoveryProcessParamsCard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <InputGroupCard width="66%" header="Recovery Process Parameters">
        <Row>
          <Col>
            {/*<TextInputWithUnits*/}
            {/*  label="Product Recovery Rate"*/}
            {/*  units="%"*/}
            {/*  placeholder="Optional"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.prod_reco_rate ?*/}
            {/*      this.props.processParams.prod_reco_rate * 100 : ''*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="prod_reco_rate"*/}
            {/*/>*/}
            {/*<TextInputWithUnits*/}
            {/*  label="Solvent/Extractant Loading Rate"*/}
            {/*  placeholder="Optional"*/}
            {/*  units="g/g-product"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.solvent_extractant_loading_rate ?*/}
            {/*      this.props.processParams.solvent_loading_rate : ''*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="solvent_extractant_loading_rate"*/}
            {/*/>*/}
            <TextInputWithUnits
              label="Solvent/Extractant Price"
              placeholder="Optional"
              units="$/kg"
              defaultValue={
                this.props.processParams.solvent_price
              }
              onChange={this.props.inputOnChange}
              param="solvent_price"
            />
            <TextInputWithUnits
              label="Solvent/Extractant Density"
              placeholder="Optional"
              units="%"
              defaultValue={
                this.props.processParams.solvent_density
              }
              onChange={this.props.inputOnChange}
              param="solvent_density"
            />
            <TextInputWithUnits
              label="Solvent/Extractant Boiling Point"
              units="°C"
              placeholder="Optional"
              defaultValue={
                this.props.processParams.solvent_bp
              }
              onChange={this.props.inputOnChange}
              param="solvent_bp"
            />
            {/*<BinaryButtonGroup*/}
            {/*  required={false}*/}
            {/*  title="Solvent/Extractant Solubility in Water"*/}
            {/*  left_label="Soluble"*/}
            {/*  right_label="Insoluble"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.solvent_solub_in_water*/}
            {/*  }*/}
            {/*  onClick={this.props.inputOnChange}*/}
            {/*  param="solvent_solub_in_water"*/}
            {/*  formValidated={this.props.inputParamsFormValidated}*/}
            {/*/>*/}
          </Col>
          <Col>
            {/*<TextInputWithUnits*/}
            {/*  label="Solvent/Extractant Enthalpy <br/> at Boiling Point"*/}
            {/*  units="kJ/mol"*/}
            {/*  placeholder="Optional"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.solvent_extractant_enthalpy_at_bp*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="solvent_extractant_enthalpy_at_bp"*/}
            {/*/>*/}
            {/*<TextInputWithUnits*/}
            {/*  label="Consumable Life"*/}
            {/*  units="hr"*/}
            {/*  placeholder="Optional"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.consumable_life ?*/}
            {/*      this.props.processParams.consumable_life : ''*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="consumable_life"*/}
            {/*/>*/}
            {/*<TextInputWithUnits*/}
            {/*  label="Consumable Cost"*/}
            {/*  units="$"*/}
            {/*  placeholder="Optional"*/}
            {/*  defaultValue={*/}
            {/*    this.props.processParams.consumable_cost ?*/}
            {/*      this.props.processParams.consumable_cost : ''*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="consumable_cost"*/}
            {/*/>*/}
            <TextInputWithUnits
              label="Electricity Price"
              units="$/kWh"
              defaultValue={
                this.props.processParams.elec_price
              }
              onChange={this.props.inputOnChange}
              param="elec_price"
            />
            <Form.Group>
              <h6>Onsite Storage Time</h6>
              <Form.Control
                required
                param="storage_time"
                as="select"
                size="sm" custom
                style={{width: "90%"}}
                defaultValue={this.props.processParams.storage_time}
                onChange={this.props.inputOnChange}
              >
                <option></option>
                <option value='12'>12 hours</option>
                <option value='24'>24 hours</option>
                <option value='48'>48 hours</option>
                <option value='72'>72 hours</option>
                <option value='168'>7 days</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                *Required
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </InputGroupCard>
    )
  }
};

class MicrobePropsCard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <InputGroupCard width="28%" header="Microbe Properties">
        <h6>
          Microbial Host
        </h6>
        <div>
          <Form.Group>
            <Form.Control
              required
              as="select"
              size="sm"
              style={
                this.props.prodMicrobProps.microbial_host.includes('.') ?
                  {width: '90%', fontStyle: 'italic'}
                  : {width: '90%'}
              }
              defaultValue={
                this.props.prodMicrobProps.microbial_host ?
                  this.props.prodMicrobProps.microbial_host : ''
              }
              onChange={this.props.inputOnChange}
              param='microbial_host'
            >
              <option></option>
              <option>Yeast</option>
              <option>Mammalian Cell</option>
              <option>Z. mobilis</option>
              <option>E. coli</option>
              <option>P. notatum</option>
              <option>Other</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              *Required
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <TextInputWithUnits
          key={this.props.prodMicrobProps.microbial_host}
          required={true}
          label="Cell Diameter"
          placeholder=""
          units="microns"
          defaultValue={
            this.props.prodMicrobProps.microbial_diameter ?
              parseFloat(
                this.props.prodMicrobProps.microbial_diameter).toFixed(2)
              : ''
          }
          param='microbial_diameter'
          onChange={this.props.inputOnChange}
        />
      </InputGroupCard>
    )
  }
};

class ProductSpecsCard extends React.Component {
  constructor(props) {
    super(props)
  }

  //TODO: refactor
  renderSolubilitySwitch(soluble_in_water) {
    switch (soluble_in_water) {
      case true:
      case 'yes':
      case 'Soluble':
        return 'Soluble';
      case false:
      case 'no':
      case 'Insoluble':
        return 'Insoluble'
      default:
        return null;
    }
  }

  renderInclusionBodySwitch(form_inclusion_bodies) {
    switch (form_inclusion_bodies) {
      case true:
      case 'yes':
      case 'Formation':
        return 'Formation';
      case false:
      case 'no':
      case 'No Formation':
        return 'No Formation'
      default:
        return null;
    }
  }

  renderInclusionBodyBtnGroup(prodMicrobProps, onClick) {
    if (prodMicrobProps.position_in_cell === 'Intracellular') {
      return (
        <BinaryButtonGroup
          required={true}
          formValidated={this.props.inputParamsFormValidated}
          title="Inclusion Body Formation"
          left_label="Formation" right_label="No Formation"
          defaultValue={
            this.renderInclusionBodySwitch(
              prodMicrobProps.form_inclusion_body
            )
          }
          param='form_inclusion_body'
          onClick={onClick}
        />
      )
    }
  }

  render() {
    const prodMicrobProps = this.props.prodMicrobProps;
    return (
      <InputGroupCard width="70%" header="Product Specifications">
        <Row>
          <Col>
            <div>
              <h6>Product Type/Application</h6>
              <Form.Group>
                <Form.Control
                  required={true}
                  param="prod_type"
                  as="select"
                  size="sm" custom
                  style={{width: '90%'}}
                  defaultValue={
                    prodMicrobProps.prod_type ?
                      prodMicrobProps.prod_type : ''
                  }
                  onChange={this.props.inputOnChange}
                >
                  <option></option>
                  <option>Fuel</option>
                  <option>Commodity Chemical</option>
                  <option>Pharmaceutical</option>
                  <option>Other</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  *Required
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <h6>Market Value</h6>
                {/*<BsInfoCircle*/}
                {/*  style={{marginLeft: '10px', marginBottom: '2px'}} size={16}*/}
                {/*/>*/}
                <Form.Control
                  required
                  param="market_value"
                  as="select"
                  size="sm" custom
                  style={{width: "90%"}}
                  defaultValue={this.props.prodMicrobProps.market_value}
                  onChange={this.props.inputOnChange}
                >
                  <option></option>
                  <option value="Low">Low (&lt; $10/kg)</option>
                  <option value="Moderate">Moderate ($10 - $100/kg)</option>
                  <option value="High">High (&gt; $100/kg)</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  *Required
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <h6>
              State of Matter
            </h6>
            <div>
              <Form.Group>
                <Form.Control
                  required
                  as="select"
                  size="sm"
                  defaultValue={
                    this.props.prodMicrobProps.state_of_matter ?
                      this.props.prodMicrobProps.state_of_matter : ''
                  }
                  onChange={this.props.inputOnChange}
                  param='state_of_matter'
                >
                  <option></option>
                  <option value='gas'>Gas</option>
                  <option value='liquid'>Liquid</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  *Required
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <TextInputWithUnits
              required={true}
              label="Density"
              defaultValue={
                prodMicrobProps.density ?
                  prodMicrobProps.density : ''
              }
              units="g/mL"
              param="density"
              onChange={this.props.inputOnChange}
            />
          </Col>
          <Col>
            <TextInputWithUnits
              required={true}
              label="Boiling Point"
              placeholder=""
              units="°C"
              defaultValue={
                this.props.prodMicrobProps.boil_pt ?
                  this.props.prodMicrobProps.boil_pt : ''
              }
              onChange={this.props.inputOnChange}
              param="boil_pt"
            />
            <TextInputWithUnits
              required={true}
              label="Vapor Pressure"
              placeholder=""
              units="kPa"
              defaultValue={
                this.props.prodMicrobProps.vapor_pressure ?
                  this.props.prodMicrobProps.vapor_pressure : ''
              }
              onChange={this.props.inputOnChange}
              param="vapor_pressure"
            />
            {/*<TextInputWithUnits*/}
            {/*  required={false}*/}
            {/*  label="Enthalpy at Boiling Point" placeholder="" units="kJ/mol"*/}
            {/*  defaultValue={*/}
            {/*    prodMicrobProps.enthalpy_at_bp*/}
            {/*  }*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="enthalpy_at_bp"*/}
            {/*/>*/}
            <TextInputWithUnits
              required={true}
              label="Solid Content"
              placeholder=""
              units="%"
              defaultValue={
                (this.props.processParams.solid_content * 100).toFixed(1)
              }
              onChange={this.props.inputOnChange}
              param="solid_content"
            />
            {/*<TextInputWithUnits*/}
            {/*  required={true}*/}
            {/*  label="Flow Rate" units="kg/hr" defaultValue={*/}
            {/*  this.props.processParams.flowrate ?*/}
            {/*    this.props.processParams.flowrate : ''*/}
            {/*}*/}
            {/*  onChange={this.props.inputOnChange}*/}
            {/*  param="flowrate"*/}
            {/*/>*/}
            <TextInputWithUnits
              required={true}
              label="Required Purity"
              units="%"
              // convert decimal to percentage representation by * 100
              defaultValue={this.props.prodMicrobProps.purity * 100}
              onChange={this.props.inputOnChange}
              param="purity"
              // int encoded bool for whether value is rep'd as percentage in UI
              // and thus needs to be converted to decimal form when passed
              // to backend on form submission or ajax calls
              ui_percentage={1}
            />
          </Col>
          <Col>
            <TextInputWithUnits
              required={true}
              label="Specific Heat Capacity"
              units="J/g °C"
              // convert decimal to percentage representation by * 100
              defaultValue={this.props.prodMicrobProps.spec_heat}
              onChange={this.props.inputOnChange}
              param="spec_heat"
            />
            <Form.Group>
              <BinaryButtonGroup
                required={true}
                left_label="Soluble"
                right_label="Insoluble"
                title="Solubility in Water"
                defaultValue={
                  prodMicrobProps.soluble_in_water ?
                    this.renderSolubilitySwitch(
                      prodMicrobProps.soluble_in_water
                    )
                    : null
                }
                onClick={this.props.inputOnChange}
                param="soluble_in_water"
                formValidated={this.props.inputParamsFormValidated}
              />
            </Form.Group>
            {/*<Form.Group>*/}
            {/*  <BinaryButtonGroup*/}
            {/*    required={true}*/}
            {/*    title="Heat Sensitive"*/}
            {/*    left_label="Yes" right_label="No"*/}
            {/*    defaultValue={this.props.prodMicrobProps.heat_sensitive}*/}
            {/*    onClick={this.props.inputOnChange}*/}
            {/*    param="heat_sensitive"*/}
            {/*    formValidated={this.props.inputParamsFormValidated}*/}
            {/*  />*/}
            {/*</Form.Group>*/}
            <Form.Group>
              <BinaryButtonGroup
                required={true}
                formValidated={this.props.inputParamsFormValidated}
                title="Crystallizable"
                left_label="Yes" right_label="No"
                defaultValue={this.props.prodMicrobProps.crystallizable}
                onClick={this.props.inputOnChange}
                param="crystallizable"
              />
            </Form.Group>
            <Form.Group>
              <BinaryButtonGroup
                required={true}
                formValidated={this.props.inputParamsFormValidated}
                title="Product Accumulation"
                left_label="Intracellular" right_label="Extracellular"
                defaultValue={
                  this.props.prodMicrobProps.position_in_cell ?
                    this.props.prodMicrobProps.position_in_cell : null
                }
                onClick={this.props.inputOnChange}
                param="position_in_cell"
              />
            </Form.Group>
            <Form.Group>
              {this.renderInclusionBodyBtnGroup(
                this.props.prodMicrobProps, this.props.inputOnChange
              )}
            </Form.Group>
          </Col>
        </Row>
      </InputGroupCard>
    )
  }
};


class InputGroupCard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let width;
    if (this.props.width) {
      width = this.props.width
    } else {
      width = "24%"
    }
    return (
      <Card style={{width: width, height: "auto", "marginBottom": "1%"}}>
        <Card.Header className="text-center">{this.props.header}</Card.Header>
        <Card.Body style={{"paddingTop": 0}}>
          <Card.Title>{this.props.title}</Card.Title>
          <Card.Text>{this.props.text}</Card.Text>
          {this.props.children}
        </Card.Body>
      </Card>
    )
  }
}


class CostAnalysisCard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Card style={{width: "100%", height: "100%"}}>
        <Card.Header className="text-center">{this.props.header}</Card.Header>
        <Card.Body>
          <Card.Title>{this.props.title}</Card.Title>
          <Card.Text>{this.props.text}</Card.Text>
          {this.props.children}
        </Card.Body>
      </Card>
    )
  }
}


class ComponentTemplate extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div></div>
    )
  }
}

// ========================================
// Helper functions
// ========================================
const numWithCommas = function (x, d = 0) {
  return parseFloat(x).toFixed(d).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const numWithCommasUSD = function (x, d = 2) {
  return '$' + numWithCommas(parseFloat(x).toFixed(d), d)
}
// ========================================


export default App;

const container = document.getElementById("app");
ReactDOM.render(
  <App/>
  ,
  container
);

