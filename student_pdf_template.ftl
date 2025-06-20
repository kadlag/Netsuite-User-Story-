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
        <span style="font-size:15pt;" >Student Registration Record</span>
      </td>
    </tr>
  </table>

       <table class="" style="width: 100%; margin-top: 10px;">
        <tr>
            <th>Student Name:</th>
            <th>Roll No:</th>
            <th>College Name:</th>
            <th>Contact Number:</th>
            <th>Location:</th>
            <th>Date:</th>

        </tr>
        <tr>
           <td style="padding-top: 2px;">${record.name}</td>
           <td style="padding-top: 2px;"> ${record.custrecord_bits_stud_roll_no}</td>
           <td style="padding-top: 2px;">${record.custrecord_bits_stud_college_name}</td>
           <td style="padding-top: 2px;">${record.custrecord_bits_stud_contact_number}</td> 
           <td style="padding-top: 2px;">${record.custrecord_bits_student_location}</td> 
          <td style="padding-top: 2px;">${record.custrecord_bits_stud_date}</td> 
        </tr>
    </table>
         
   <table class="" style="margin-top:15px;width: 100%;">
    <tr>
      <td align="center" style="border: none;">
        <span style="font-size:15pt;">Education Details</span>
      </td>
    </tr>
  </table>

 <table class="" style="width: 100%; margin-top: 10px;">

        <tr>
            <th>Qualification</th>
            <th>Department</th>
        </tr>
       
        <tr>
           <td style="padding-top: 2px;">${record.custrecord_bits_stud_qualification}</td>
           <td style="padding-top: 2px;"> ${record.custrecord_bits_stud_department}</td>
           
        </tr>
    </table>

        

    <table class="" style="width: 100%; margin-top: 20px;">
        <tr>
           <td align="center" style="border: none; ">
           <span style="font-size:15pt;">Subjects and Marks</span>
          </td>
        </tr>
    </table>
  

<table style="width: 100%; margin-top: 10px;">
  <thead>
    <tr>
      <th colspan="3" align="center" style="padding: 10px 6px;">Subject</th>
      <th colspan="3" align="center" style="padding: 10px 6px;">Marks</th>
      <th colspan="3" align="center" style="padding: 10px 6px;">Grade</th>
    </tr>
  </thead>
  <#list student_info.lines as line>
    <tr>
      <td colspan="3" align="center">${line.custrecord_bits_subject_name}</td>
      <td colspan="3" align="center">${line.custrecord_bits_stud_info_marks}</td>
      <td colspan="3" align="center">${line.custrecord_bits_student_info_grade}</td>
    </tr>
  </#list>
</table>

      <hr style="width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px; margin-top: 30px;;" />
 
</body>
</pdf>
