<template>
  <div>
    <div
      class="d-flex flex-row"
      style="margin-top: 2%; margin-bottom: 2%"
    ></div>
    <v-card>
      <v-card-title>
        Lista de proyectos
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Nombre del proyecto"
          single-line
          hide-details
          color="red"
        ></v-text-field>
      </v-card-title>
      <div align="center">
        <v-data-table :headers="headers" :items="proyects" :search="search">
          <template v-slot:[`item.progreso`]="{ item }">
            <v-btn
              rounded
              color="greenButton"
              width="25%"
              dark
              @click="verProgreso(item)"
            >
              <v-icon> mdi-eye </v-icon>
            </v-btn>
          </template>
           <template v-slot:[`item.avances`]="{ item }">
            <v-btn
              rounded
              color="blueButton"
              width="25%"
              dark
              @click="verAvances(item)"
            >
              <v-icon> mdi-eye </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </v-card>
    <v-dialog v-model="dialog" persistent max-width="600">
      <v-card rounded="lg">
        <v-card-title class="red">
          <span class="headline" style="color: white"
            ><v-icon color="white">mdi-progress-clock</v-icon> Proyecto
            {{ this.seeDataRow.name }}
          </span>
        </v-card-title>
        <v-card-text class="mt-5">
          <span class="black--text"
            >Progreso total: {{ this.progresoTotal }}%</span
          >
          <v-progress-linear
            color="teal"
            height="10"
            buffer-value="100"
            class="mt-2"
            :value="this.progresoTotal"
          ></v-progress-linear>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="gary"  @click="dialog = false , limpiar()"> Cerrar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    
     <v-dialog v-model="dialog2" persistent width="800">
      <v-card>
        <v-card-title>
          <v-btn
            color="greenButton"
            class="white--text"
            style="margin-right: 1%"
            rounded
            @click="(dialog2 = false)"
          >
            <v-icon class="white--text">mdi-arrow-left-thick</v-icon>
          </v-btn>
          Avances de: {{ seeDataRow.name }}
          <v-spacer></v-spacer>
          <v-text-field
            v-model="searchAvance"
            append-icon="mdi-magnify"
            label="Buscar"
            color="red"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="encabezado"
          :search="searchAvance"
          :items="avances"
        >
          <template v-slot:[`item.descargar`]="{ item }">
            <v-btn
              rounded
              color="blueButton"
              dark
              @click="descargar(item.id)"
            >
              <v-icon> mdi-cloud-download </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import ProjectService from "../../../services/projectManager/service/ProjectService";
import ProgressService from "../../../services/projectManager/service/ProgressService";
import axios from "axios";
export default {
  name: "ProgressTable",
  data() {
    return {
      search: "",
      searchAvance: "",
      headers: [
        { text: "Nombre del proyecto", value: "name" },
        { text: "Nombre del responsable", value: "employe.fullName" },
        { text: "Ver progreso", value: "progreso" },
        { text: "Ver avances", value: "avances"}
      ],
      encabezado: [
        { text: "Nombre", aling: "center", value: "deliverableAssigment.deliverable.name" },
        { text: "Comentario final", aling: "center", value :"description"},
        { text: "Descargar avance", aling: "center", value :"descargar"},
      ],
      progresoTotal: 0,
      proyects: [],
      avances: [],
      progreso: [],
      seeDataRow: {},
      dialog: false,
      dialog2: false,
    };
  },
  methods: {
    limpiar(){
      this.progresoTotal = 0
    },

    // Datos en la data-table
     verAvances(item){
      this.seeDataRow = {}
      this.dialog2 = true;
      this.seeDataRow = item
      ProgressService.searchIdProject(this.seeDataRow.id)
      .then(response =>{
        this.avances = response.data
      }).catch(e =>{
        console.log(e)
      })

    },

    // Suma de los porcentajes de los entregables
    progressSuma(){
        this.progreso.map(item =>{
        this.progresoTotal += item.deliverableAssigment.percent
      })
    },


    // Obtener todos los porcentajes dependiendo del "id" del proyecto
    getAllProgress(id){
      ProgressService.searchIdProject(id)
      .then(response =>{
        this.progreso = response.data
        this.progressSuma()
      }).catch(e =>{
        console.log(e)
      })

    
    },

    //Obtiene todos los proyectos
    getAllProyects(){
      ProjectService.getAll()
      .then(response =>{
        this.proyects = response.data
      })
      .catch(e =>{
        console.log(e)
      })

    },

    // Desacarga el avance

      descargar(idavance) {
      const token = localStorage.getItem("accessToken");
      axios({
        url: "http://35.172.158.0:2000/avance/descargar/" + idavance,
        method: "GET",
        responseType: "blob", // important
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          let disposition = response.headers["content-disposition"]; // Obtener contenido-disposici??n
          let fileInfo = disposition
            ? disposition.substr(disposition.indexOf("filename")) //saca el filename
            : "";
          let name = fileInfo ? fileInfo.split("=")[1] : "";
          let fileName = name.replace('"', ""); //le quita la primer "
          // BLOB NAVIGATOR
          const url = window.URL.createObjectURL(new Blob([response.data])); //genera el blob
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName.replace('"', "")); //le quita el ??ltimo ", manda el nombre del archivo
          document.body.appendChild(link);
          link.click();
        })
        .catch((e) => {
          console.log(e);
          Notify.error("getData");
        });
    },



    verProgreso(item) {
      let id = 0
      this.dialog = true;
      this.seeDataRow = item;
      id = this.seeDataRow.id
      this.getAllProgress(id)
    },
  },

  mounted(){
    this.getAllProyects()
  }
};
</script>