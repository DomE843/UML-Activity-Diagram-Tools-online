function customClearSelections() {
  mySubDiagram.clearHighlighteds();
  mySubDiagram.clearSelection();
  if (highlighter && highlighter.visible) {
    highlighter.visible = false;
  }
}

function activityLoad() {
  /*  JsonData text in html MUST be Json-Format string  */
  var srcJson = $("#myActivitySavedModel").text();

  if (srcJson != "") {
    // const nodesLinks = getNodesLinks("ClaDiagram");

    // let jsonObj = JSON.parse(srcJson);
    // jsonObj.nodeDataArray.push(nodesLinks.nodeDataArray);
    // jsonObj.linkDataArray.push(nodesLinks.linkDataArray);
    // srcJson = JSON.stringify(jsonObj);

    mySubDiagram.model = go.Model.fromJson(srcJson);

    //### 更新画板大小 Start ###by:ljq//
    let drawingBoard = mySubDiagram.model.modelData.DrawingBoard;
    if (drawingBoard != undefined) {
      let parts = mySubDiagram.parts;
      while (parts.next()) {
        let data = parts.value;
        if (data.layerName === "DrawingBoard") {
          data.width = drawingBoard.width;
          data.height = drawingBoard.height;
          break;
        }
      }
    }
    //### 更新画板大小 End ###by:ljq//
  } else {
    activityCaseStudy();
  }

  mySubDiagram.isModified = true;
}

function activityCaseStudy() {
  const srcJson = "../../../server/activityDiagram_tgf/public/src/json/loopPathTest.json";
  $.getJSON(srcJson, function (result) {
    mySubDiagram.model = go.Model.fromJson(result);
  });
}

function activitySave() {
  //### 解决points导致的连线错位 Start ###by:ljq//
  let linkDataArray = mySubDiagram.model.linkDataArray;
  for (let i = 0; i < linkDataArray.length; i++) {
    delete(linkDataArray[i].points);
  }
  //### 解决points导致的连线错位 End ###by:ljq//

  //### 更新画板大小 Start ###by:ljq//
  let parts = mySubDiagram.parts;
  while (parts.next()) {
    let data = parts.value;
    if (data.layerName === "DrawingBoard") {
      mySubDiagram.model.modelData.DrawingBoard = {
        "width": data.width,
        "height": data.height
      };
      break;
    }
  }
  //### 更新画板大小 End ###by:ljq//

  // popDiv('ADdiv_json');

  document.getElementById("myActivitySavedModel").value = mySubDiagram.model.toJson();
  mySubDiagram.isModified = false;
}

/*************************************Print Image Start **********************************/
function printscreen() {
  var svgWindow = window.open();
  if (!svgWindow) return;  // failure to open a new Window
  let bnds = mySubDiagram.documentBounds;
  let x = bnds.x;
  let y = bnds.y;
  let width = bnds.width;
  let height = bnds.height;
  let printSize = new go.Size(width, height);

  let image = mySubDiagram.makeImage({
    scale: 1,//缩放比例
    size: printSize, //生成图片大小
    maxSize: printSize, //限定图片的尺寸
    position: new go.Point(x, y),
    background: "white" ,//背景颜色
    type: "image/png", //生成图片类型
    // details: 0.9 //生成图片清晰度 （只在jpg格式下有效，取值范围0-1）
  });
  // 将图片的src属性作为URL地址
  var url = image.src;
  var a = document.createElement('a');
  var event = new MouseEvent('click');
  a.download = 'image';
  a.href = url;
  a.dispatchEvent(event);
}

/**********************************Print Image End**********************************/

function activityDiagramZoomToFit() {
  // mySubDiagram.autoScale = go.Diagram.Uniform;
  mySubDiagram.zoomToFit();
}

/*
@Function:  Filter the needed Diagram's model from mainDiagram's savedJsonData
@Parameter: 
    UmlJsonId:    Html Id of mainDiagram's savedJsonModel
    targetDiag:   name of diagram from which you want to get its data;
*/
function getNodesLinks(targetDiag) {
  const UmlJsonDataString = $('#myUmlSavedModel', parent.document).val();
  const UmlJsonDataObj = JSON.parse(UmlJsonDataString);
  var modelData = {
    nodeDataArray: null,
    linkDataArray: null
  };

  for (let i = 0; i < UmlJsonDataObj.nodeDataArray.length; i++) {
    const e = UmlJsonDataObj.nodeDataArray[i];
    if (e.key == targetDiag) {
      modelData.nodeDataArray = new Array(e.umlDiagramData["nodeDataArray"]);
      modelData.linkDataArray = new Array(e.umlDiagramData["linkDataArray"]);
    }
  }

  return modelData;
}

function inspectorToggle() {
  if ($("#activityInspectorDiv").css("display") === "none") {
    // window.actInspector = actInspector;
    $("#activityInspectorDiv").css("display", "block");
    custAlert("Please Select an Element");
  } else {
    $("#activityInspectorDiv").css("display", "none");
  }
}

function overviewToggle() {
  var view = $('#myOverviewDiv');
  if (view.hasClass('myOverview-click-transiton')) {
    view.removeClass('myOverview-click-transiton')
    //display设置为none，即不模块不占用空间，否则会影响画图
    setTimeout(function () {
      view.css("display", "none");
    }, 300);
  } else {
    view.css("display", "block");
    setTimeout(function () {
      view.addClass('myOverview-click-transiton');
    }, 200);
  }
}

/*
@Function:    Show(/Hide) the ObjId Div if the 'isHiden' is True(/False)
@Parameter:   
  objId is a String of Element's ID
*/
function viewToggle(objId) {
  const xObj = $("#"+objId);
  var diagIncre, px_right;
  
  if (xObj.css("display") === "none") {
    diagIncre = 0.9;
    px_right = "right: 210px";
    xObj.css("display", "block");
  } else {
    diagIncre = 1.1;
    px_right = "right: 8.5px";
    xObj.css("display", "none");
  }
  
  $("#myButton").css("cssText", px_right);
  $("#myOverviewDiv").css("cssText", px_right);
  mySubDiagram.commandHandler.increaseZoom(diagIncre);
}

function setLinkContext() {
  var sel = mySubDiagram.selection.first();
  if (sel instanceof go.Link) {
    // var x = prompt("输入规则：", "<Rule1, <Element>>");
    mySubDiagram.model.setDataProperty(sel, "Rules", "x");
  }
}

function showModelElements() {
  const allNodes = mySubDiagram.nodes; // include 'Group' nodes
  if (!allNodes.count) return false;

  var li;
  var liPng = "../src/images/palette/";
  var it = allNodes.iterator;
  it.next(); //@NOTE: Necessary !!!

  do {
    switch (it.value.category) {
      /*    Diagram Nodes   */
      case NodeCategories[0]:
        liPng += "act_initial.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[1]:
        liPng += "act_end.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[2]:
        liPng += "act_flowEnd.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[3]:
        liPng += "act_connector.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[4]:
        liPng += "act_action.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[5]:
        liPng += "act_object.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[6]:
        liPng += "act_decision.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[7]:
        liPng += "act_merge.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[8]:
        liPng += "act_fork.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case NodeCategories[9]:
        liPng += "act_join.png";
        li = genLiElement(liPng, it.value.text);
        break;
      /*    Diagram Groups   */
      case GroupCategories[0]:
        liPng += "act_lane.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case GroupCategories[1]:
        liPng += "act_interruption.png";
        li = genLiElement(liPng, it.value.text);
        break;
      case GroupCategories[2]:
        liPng += "act_activityParam.png";
        li = genLiElement(liPng, it.value.text);
        break;
      default:
        break;
    }

    $("#ModelElementsDiv").append(li);
  } while (it.next());
}

function genLiElement(png, txt) {
  var li = document.createElement("li");
  var liEPng = document.createElement("img");
  var liEDiv = document.createElement("span");
  
  liEPng.src = png;
  liEDiv.innerText = txt;

  li.append(liEPng);
  li.append(liEDiv);

  return li;
}

/*                        Diagram Editing Operation --- Start
  @NOTE:  Functions below are mainly constrained by go.GraphLinksModel in GoJS,
          such as ".addNodeData"
*/
////// Basic functions
function _findLinksByKeys(from, to) {
  var f = mySubDiagram.findNodeForKey(from);
  var t = mySubDiagram.findNodeForKey(to);
  return f.findLinksBetween(t);
}

function getNodeByName(name) {
  var data;
  mySubDiagram.nodes.each(nd => {
    if (nd instanceof go.Node && nd.data.text == name){
      data = nd.data;
      return true;
    }
  });
  return data;
}

function getLinkByName(name) {
  var data;
  mySubDiagram.links.each(lk => {
    if (lk instanceof go.Link && lk.data.text == name){
      data = lk.data;
      return true;
    }
  });
  return data;
}

// Update
function trans_update_node(node, name, newText, prop) {
  var data = getNodeByName(name);

  mySubDiagram.startTransaction("update_node_data");
  // mySubDiagram.model.setDataProperty(data, "category", newCate);
  mySubDiagram.model.setDataProperty(data, "text", newText);
  mySubDiagram.commitTransaction("update_node_data");
}

// Add
function trans_add_node(newCate, newText) {
  mySubDiagram.startTransaction("add_node_data");
  var nodeData = { category: newCate, text: newText };
  nodeData["loc"] = go.Point.stringify(new go.Point(200, 300));  

  mySubDiagram.model.addNodeData(nodeData);
  mySubDiagram.commitTransaction("add_node_data");
}

// Remove 
function trans_remove_node(name) {
  var data = getNodeByName(name);

  mySubDiagram.startTransaction("remvoe_node_data");
  mySubDiagram.model.removeNodeData(data);
  mySubDiagram.commitTransaction("remvoe_node_data");
}


function trans_update_link(from, to, newCate="ControlFlow", newText="") {
  var linkIter = _findLinksByKeys(from, to).iterator;

  mySubDiagram.startTransaction("update_link_data");
  linkIter.each (lk => {
    mySubDiagram.model.setDataProperty(lk.data, "category", newCate);
    mySubDiagram.model.setDataProperty(lk.data, "text", newText);
  });
  mySubDiagram.commitTransaction("update_link_data");
}

function trans_add_link(fKey, tKey, newCate="ControlFlow", newText="") {
  var linkdata = {
    from: fKey, 
    to: tKey,
    category: newCate,
    text: newText
  };

  mySubDiagram.startTransaction("add_link_data");
  mySubDiagram.model.addLinkData(linkdata);
  mySubDiagram.commitTransaction("add_link_data");
}

function trans_remove_link(name) {
  var data;

  mySubDiagram.startTransaction("remove_link_data");
  mySubDiagram.links.each(lk => {
    if (lk.data.category == "ControlFlow" && lk.data.text == name){
      data = lk.data;
      return true;
    }
  });
  mySubDiagram.model.removeNodeData(data);
  mySubDiagram.commitTransaction("remove_link_data");
}

function ocl_apply_del(node,prop, name) {
  // if (prop == "node") {
    trans_remove_node(name); 
  // } else {
  //   trans_remove_link(name); 
  // }
}

function ocl_apply_add(node, name, prop) {
  if (prop == "node") {
    trans_add_node(prop, name); 
  } else {
    // trans_add_link(prop, name); 
  }
}

function ocl_apply_upd(node, oldV, newV, prop) {
  // if (prop == "node") {
    trans_update_node(node.text, oldV, newV, prop); 
  // } else {
  // }
}
/*            Diagram Editing Operation ---End                   */ 


/* Trace/Loop finding - Customize for each diagram --- S  */
const pathsDivId = "activityDiagramPath";

function getBegins(list) {
  let begin = mySubDiagram.findNodesByExample({
    category: NodeCategories[0]
  });
  list.addAll(begin);

}

function getEnds(list) {
  mySubDiagram.nodes.iterator.each(nd => {
    const cat = nd.category;
    if (cat === NodeCategories[1] || cat === NodeCategories[2]) {
      list.push(nd);
    }
  });
}

function initPathsDiv() {
  popDiv("div.aDFooter");
  popDiv("#ADdiv_trace");
  $("#" + pathsDivId).find("option").remove();

  normPaths.clear();
  loopPaths.clear();
}

function subDiagramTrace() {
  var bLst = new go.List();
  var eLst = new go.List();

  getBegins(bLst);
  getEnds(eLst);

  initPathsDiv();
  findPathsBetweenTypes(bLst, eLst);
}

function subDiagramLoop() {
  let bLst = new go.List();
  let eLst = new go.List();

  getBegins(bLst);
  getEnds(eLst);

  initPathsDiv();
  findLoopsBetweenTypes(bLst, eLst);
}
/* Trace/Loop finding - Customize for each diagram --- E  */


//#################### Unified Structure of AD - S ############################
function constructUS() {
    mySubDiagUS = usDiag(1);

    // add into US.Ele by User-defined property of "node.data" 
    mySubDiagUS.mergeCatesInternally(mySubDiagUS.ModelElement, ['Action','Object'], "AO");
    mySubDiagUS.mergeCatesInternally(mySubDiagUS.DependencyRelation, ['ControlFlow','ObjectFlow'], "ActivityEdge");

    console.log(mySubDiagUS);
}

function buildDegreeByCate() {
  let degreeModel = {};

  mySubDiagram.nodes.each(pt => {
    if (pt instanceof go.Node) {
      let degreesWithType = {
        text: pt.data.text,
        category: pt.category,
        in: pt.findLinksInto().count,
        out: pt.findLinksOutOf().count,
      };

      Object.assign(degreeModel, {
        [pt.key]: degreesWithType
      });
    }
  });

  console.log(degreeModel);
  // return degreeModel;
}
//#################### Unified Structure of AD - E ############################