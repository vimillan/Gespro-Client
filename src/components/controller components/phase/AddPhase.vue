<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn rounded color="blueButton" dark v-bind="attrs" v-on="on">
        <v-icon left class="white--text">mdi-plus-circle</v-icon>
        Agregar fase
      </v-btn>
    </template>
    <v-card class="rounded-lg">
      <v-card-title class="red">
        <span class="headline" style="color: white">
          <v-icon color="white">mdi-plus-circle</v-icon> Añadir fase
        </span>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-text-field
          color="red"
          v-model="phase.name"
          outlined
          label="Nombre de la fase"
          prepend-inner-icon="mdi-ballot"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          elevation="2"
          color="blue-grey darken-1"
          text
          @click="dialog = false, clean()"
        >
          Cancelar
        </v-btn>
        <v-btn elevation="2" color="green darken-1" text @click="savePhase()">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import PhaseService from "../../../services/controller/service/PhaseService";
import Notify from "../../../notifications/Notify";
export default {
  name: "AddPhase",
  data() {
    return {
      phase: {
        id: null,
        name: "",
      },
      dialog: false,
    };
  },
  methods: {
    clean() {
      this.phase.id = null;
      this.phase.name = "";
    },
    savePhase() {
      //Validación de campos vacios
      if (this.phase.name === "") {
        //Advertencia
        Notify.fillFields("form-phase");
      } else {
        //se valida que el nombre sea único
        PhaseService.existName(this.phase.name)
          .then((response) => {
            if (response.data === true) {
              Notify.fillFields("valid-phase");
            } else {
              //Petición para guardar el proyecto
              PhaseService.save(this.phase)
                .then((response) => {
                  //Toast de hecho
                  Notify.done("phase");
                  this.clean();
                  this.dialog = false;
                  this.reload();
                })
                .catch((e) => {
                  //Toast de error al guardar
                  Notify.error("saveData");
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    reload() {
      //se recibe el método de getAllPhases con ekl nombre de charge
      this.$emit("charge");
    },
  },
};
</script>