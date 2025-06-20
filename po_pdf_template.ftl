<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
  <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
  <style type="text/css">
    body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #333;
      }
      h2 {
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
     
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #000;
        padding: 6px;
        text-align: center;
      }
      th {
        background-color: #f0f0f0;
      }
	
  </style>
</head>
<body header="nlheader" footer="nlfooter" padding="0.3in">

<table class="" style=" border: none;width: 100%;">
    <tr>
    <td style="border: none; ">
       <img src="https://tstdrv2080458.app.netsuite.com/core/media/media.nl?id=8618&amp;c=TSTDRV2080458&amp;h=eexhVFtW4C16wEaLMJB4LitWdah7xrM9j1ayFErWib7ZwEG3" width="100" height="100"/>
      </td>
    </tr>
  </table>
  
  <table class="" style=" border: none;width: 100%;">
    <tr>
      <td align="center" style="border: none; ">
        <span style="font-size:15pt;" >Bits Purchase Order Record</span>
      </td>
    </tr>
  </table>

       <table class="" style="width: 100%; margin-top: 10px;">
        <tr>
            <th align="center"  colspan="3">Vendor ID</th>
            <th align="center"  colspan="3">Vendor Name</th>
            <th align="center"  colspan="3">Location</th>
            <th align="center"  colspan="3">Date</th>
            <th align="center"  colspan="3">Currency</th>
            <th align="center"  colspan="3">Department</th>
            <th align="center"  colspan="3">Approval Status</th>

        </tr>
        <tr>
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_bits_vendor_id}</td>
           <td style="padding-top: 2px;" align="center"  colspan="3"> ${record.name}</td>
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_location_po}</td>
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_bits_date}</td> 
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_po_currency}</td> 
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_bits_po_department}</td> 
           <td style="padding-top: 2px;" align="center"  colspan="3">${record.custrecord_bits_approval_status}</td> 
        </tr>
    </table>
        
    <table class="" style="width: 100%; margin-top: 20px;">
        <tr>
           <td align="center" style="border: none; ">
           <span style="font-size:15pt;">Vendor Info</span>
          </td>
        </tr>
    </table>
  

<table style="width: 100%; margin-top: 10px;">
  <thead>
    <tr>
      <th colspan="3" align="center" style="padding: 10px 6px;">ID</th>
      <th colspan="3" align="center" style="padding: 10px 6px;">Company Name</th>
      <th colspan="3" align="center" style="padding: 10px 6px;">Employee Name</th>
      <th colspan="3" align="center" style="padding: 10px 6px;">Contact Number</th>
     
    </tr>
  </thead>
  <#list vendor_info.lines as line>
    <tr>
  
      <td colspan="3" align="center">
      <#if line.custrecord_bits_cust_vendor_name?? && line.custrecord_bits_cust_vendor_name?has_content && line.custrecord_bits_cust_vendor_name !="null" >
        ${line.custrecord_bits_cust_vendor_name}
      <#else>
      -
      </#if>
      </td>

      <td colspan="3" align="center">
       <#if line.custrecord_bits_vendor_company_name?? && line.custrecord_bits_vendor_company_name?has_content && line.custrecord_bits_vendor_company_name != "null">
        ${line.custrecord_bits_vendor_company_name}
      <#else>
      -
      </#if>
      </td>
      <td colspan="3" align="center"> 
      <#if line.name?? && line.name?has_content && line.name!="null">
        ${line.name}
      <#else>
      -
      </#if></td>
      
      <td colspan="3" align="center">
       <#if line.custrecord_bits_contact_number?? && line.custrecord_bits_contact_number?has_content && line.custrecord_bits_contact_number != "null">
        ${line.custrecord_bits_contact_number}
      <#else>
      -
      </#if>
      </td>
    
    </tr>
  </#list>
</table>

      <hr style="width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px; margin-top: 30px;;" />
 
 <table class="" style="width: 100%; margin-top: 10px;">
        <tr>
            <th align="right"  colspan="3" style="border: none; ">Total Amount:</th>
        </tr>
       <tr>
       <td style="padding-top: 2px; border: none; background-color: #f0f0f0;" align="right"  colspan="3" >${record.custrecord_bits_total_amount}</td>
      </tr>
    </table>

</body>
</pdf>
