<template>
  <div>
    <div
      class="d-flex flex-row"
      style="margin-top: 2%; margin-bottom: 2%"
    ></div>
    <v-card>
      <v-card-title>
        Lista de entregables
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
          color="red"
        >
        </v-text-field
      ></v-card-title>
      <div>
        <v-data-table
          :headers="encabezado"
          :items="deliverables"
          :search="search"
          :items-per-page="5"
        >
          <template v-slot:[`item.down`]="{ item }">
            <v-btn
              rounded
              color="blueButton"
              @click="descargar(item.deliverable.id)"
            >
              <v-icon class="white--text">mdi-cloud-download</v-icon>
            </v-btn>
          </template>

          <template v-slot:[`item.up`]="{ item }">
            <v-btn rounded color="greenButton" @click="subir(item)">
              <v-icon class="white--text">mdi-cloud-upload</v-icon>
            </v-btn>
          </template>
        </v-data-table>
        <div class="text-center">
          <!--Dialog de subir el avance-->
          <v-dialog v-model="dialog" width="500">
            <v-card class="rounded-lg">
              <v-card-title class="red">
                <span class="headline" style="color: white">
                  <v-icon color="white">mdi-cloud-upload</v-icon> Subir avance
                </span>
              </v-card-title>
              <v-card-text class="mt-5">
                <v-file-input
                  outlined
                  label="Archivo"
                  @change="getFile"
                  dense
                  v-model="currentFile"
                  color="red"
                  prepend-icon=""
                  prepend-inner-icon="mdi-paperclip"
                ></v-file-input>

                <v-textarea
                  outlined
                  label="Comentario"
                  color="red"
                  v-model="progress.description"
                  name="input-7-4"
                  prepend-icon=""
                  prepend-inner-icon="mdi-message-text"
                  no-resize
                ></v-textarea>
                <v-row>
                  <v-col cols="12" sm="9" md="3"></v-col>
                  <v-col cols="12" sm="9" md="6">
                    <v-checkbox
                      v-model="progress.finish"
                      color="red"
                      label="Marcar como terminado"
                      value="true"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  elevation="2"
                  color="blue-grey darken-1"
                  text
                  @click="(dialog = false), clear()"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  elevation="2"
                  color="green darken-1"
                  text
                  @click="upload()"
                >
                  Guardar cambios
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script>
import ProgressService from "../../../services/employe/service/ProgressService";
import Notify from "../../../notifications/Notify";
import DeliverableService from "../../../services/employe/service/DeliverableService";
import ProjectPhaseService from "../../../services/employe/service/ProjectPhaseService";
import DeliverableAssigmentService from "../../../services/employe/service/DeliverableAssigmentService";
import axios from "axios";
export default {
  name: "UpDownTable",
  data() {
    return {
      selected: false,
      search: "",
      idProyecto: 0,
      encabezado: [
        {
          text: "Lista de entregables",
          align: "start",
          value: "deliverable.name",
        },
        { text: "Descargar archivo", align: "center", value: "down" },
        { text: "Subir avance", align: "center", value: "up" },
      ],
      deliverables: [],
      phases: [],
      allData: [],
      currentFile: undefined,
      idAsignacion: 0,
      nombreArchivo: "",
      progress: {
        id: null,
        description: "",
        finish: false,
        project: {
          id: 0,
        },
      },
      dialog: false,
    };
  },
  methods: {
    clear() {
      this.currentFile = undefined;
      this.progress.description = "";
      this.progress.finish = false;
    },
    subir(item) {
      this.idAsignacion = item.id;
      ProgressService.finish(this.idProyecto, this.idAsignacion)
        .then((response) => {
          if (response.data == false) {
            this.dialog = true;
          } else {
            Notify.fillFields("foundFinish");
          }
        })
        .catch((e) => {
          console.log(e);
          Notify.error("getData");
        });
    },
    getPhases(id) {
      //consulta a fase_tipo y regresa todos los elemetos seg??n el tipo de proyecto
      ProjectPhaseService.searchIdProject(id)
        .then((response) => {
          this.phases = response.data; //guarda los items de fase_tipo
          this.phases.map((item, i) => {
            let idFase = item.id; //guarda idfase_tipo (idfase_proyecto en BD)
            DeliverableAssigmentService.searchDeliverable(idFase)
              .then((response) => {
                this.allData = response.data;
                //recorremos cada uno de los objetos de fase_tipo
                this.allData.map((entregable, j) => {
                  //console.log(entregable);
                  this.deliverables.push(entregable);
                });
              })
              .catch((e) => {
                console.log(e);
                Notify.error("getData");
              });
          });
        })
        .catch((e) => {
          console.log(e);
          Notify.error("getData");
        });
    },
    upload() {
      if (!this.currentFile || this.progress.description === "") {
        Notify.fillFields("saveProgress");
      } else {
        const formData = new FormData();
        formData.append(
          `json`,
          `{"description":"${this.progress.description}","finish":"${this.progress.finish}","project":{"id":"${this.idProyecto}"},"deliverableAssigment":{"id":"${this.idAsignacion}"}}`
        );

        formData.append("archivo", this.currentFile);

        ProgressService.save(formData)
          .then((response) => {
            Notify.done("progress");
            this.clear();
            this.dialog = false;
          })
          .catch((e) => {
            console.log(e);
            Notify.error("saveData");
          });
      }
    },
    getFile(e) {
      this.currentFile = e;
    },
    descargar(identregable) {
      const token = localStorage.getItem("accessToken");
      axios({
        url: "http://35.172.158.0:2000/entregable/descargar/" + identregable,
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
  },
  mounted() {
    this.deliverables = [];
    this.getPhases(this.$route.params.id);
    this.idProyecto = this.$route.params.proyecto;
  },
};
</script>