import React from "react";
import { useState,useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem 
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import * as Yup from "yup";
import { useFormik } from "formik";
// ... otras importaciones necesarias
import { GetOneOrderByID } from "../../service/remote/get/GetOneOrderByID";
import { OrdenesDetallesInfoAdValues } from "../../helpers/OrdenesDetalleInfoAdValues";
import { UpdatePatchOneOrder } from "../../service/remote/post/AddOrdenesEstatus";
import { GetAllLabels } from "../../../labels/services/remote/get/GetAllLabels";

const OrdenesDetalleInfoAdModal = ({
  showModalInfoAd,
  setShowModalInfoAd,
  row,
  index,
  handleReload
  // Otros props que desees pasar al modal
}) => {
  const [mensajeErrorAlert, setMensajeErrorAlert] = useState("");
  const [mensajeExitoAlert, setMensajeExitoAlert] = useState("");
  const [Loading, setLoading] = useState(false);
  const [OrdenesValuesLabel, setOrdenesValuesLabel] = useState([]);


  const formik = useFormik({
    initialValues: {
        
        Actual: true,
        
    },
    validationSchema: Yup.object({
        
        Actual: Yup.boolean().required("Campo requerido"),
      }),
    onSubmit: async (values) => {
      setMensajeExitoAlert("");
      setMensajeErrorAlert("");
      setLoading(true);
      //FIC: reiniciamos los estados de las alertas de exito y error.
      setMensajeErrorAlert(null);
      setMensajeExitoAlert(null);
      try {
        // Lógica para guardar la información en la base de datos
        //console.log(row.IdInstitutoOK,row.IdNegocioOK,row.IdOrdenOK)
        const ordenExistente = await GetOneOrderByID(row.IdInstitutoOK,row.IdNegocioOK,row.IdOrdenOK);

        console.log("<<Ordenes>>",ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_info_ad);
        
        for (let i = 0; i < ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_info_ad.length; i++) {
            console.log("Entro")
            ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_info_ad[i]= {
                IdTipoEstatusOK: ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_info_ad[i].IdTipoEstatusOK,
                Actual: "N",
                Observacion:ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_info_ad[i].Observacion
              };
              console.log("Realizo",ordenExistente)
        }
        
        values.Actual == true ? (values.Actual = "S") : (values.Actual = "N");
        //ordenExistente.ordenes_detalle[index].pedidos_detalle_ps_estatus_u.push(values);
        //console.log(ordenExistente);

        const EstatusOrdenes = OrdenesDetallesInfoAdValues(values, ordenExistente,index);
        //const EstatusOrdenes = OrdenesEstatusValues(values);
        
        //console.log("<<Ordenes>>", EstatusOrdenes);
        // console.log("LA ID QUE SE PASA COMO PARAMETRO ES:", row._id);
        // Utiliza la función de actualización si estamos en modo de edición
        
        await UpdatePatchOneOrder(row.IdInstitutoOK,row.IdNegocioOK,row.IdOrdenOK,EstatusOrdenes);
        setMensajeExitoAlert("Envío actualizado correctamente");
        handleReload();
      } catch (e) {
        setMensajeExitoAlert(null);
        setMensajeErrorAlert("No se pudo registrar");
      }
      setLoading(false);
    },
  });

  const commonTextFieldProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    fullWidth: true,
    margin: "dense",
    disabled: !!mensajeExitoAlert,
  };

  async function getDataSelectOrdenesType2() {
    try {
      const Labels = await GetAllLabels();
      const OrdenesTypes = Labels.find(
        (label) => label.IdEtiquetaOK === "IdEstatusOrdenesVTA"
      );
      const valores = OrdenesTypes.valores; // Obtenemos el array de valores
      const IdValoresOK = valores.map((valor, index) => ({
        IdValorOK: valor.Valor,
        key: valor.IdValorOK, // Asignar el índice como clave temporal
      }));
      setOrdenesValuesLabel(IdValoresOK);
      console.log(OrdenesValuesLabel)
    } catch (e) {
      console.error(
        "Error al obtener Etiquetas para Tipos Giros de Institutos:",
        e
      );
    }
  }

  useEffect(() => {
    getDataSelectOrdenesType2();
  },[]);

  return (
    <Dialog open={showModalInfoAd}
    onClose={() => setShowModalInfoAd(false)}
    fullWidth  
    >
      <form onSubmit={(e) => {formik.handleSubmit(e)}}>
        <DialogTitle>
          <Typography>
            <strong>Agregar Nuevo Estado de la Orden</strong>
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column" }}
        dividers
        >
       <InputLabel htmlFor="dynamic-select-tipo-orden">Estatus de la Ubicacion del Producto/Servicio</InputLabel>
         
          <FormControlLabel
              control={
              <Checkbox
                  id="Actual"
                  checked={formik.values.Actual}  // Suponiendo que formik.values.Actual es un booleano
                  onChange={(event) => {
                  formik.setFieldValue('Actual', event.target.checked);
                  }}
                  disabled={!!mensajeExitoAlert}
              />
              }
              label="Actual*"
              error={formik.touched.Actual && Boolean(formik.errors.Actual)}
              helperText={formik.touched.Actual && formik.errors.Actual}
          />
          
          {/* Agregar otros campos aquí si es necesario */}
        </DialogContent>
        <DialogActions sx={{ display: "flex", flexDirection: "row" }}>
          <Box m="auto">
            {mensajeErrorAlert && (
              <Alert severity="error">
                <b>¡ERROR!</b> ─ {mensajeErrorAlert}
              </Alert>
            )}
            {mensajeExitoAlert && (
              <Alert severity="success">
                <b>¡ÉXITO!</b> ─ {mensajeExitoAlert}
              </Alert>
            )}
          </Box>
          <LoadingButton
            color="secondary"
            loadingPosition="start"
            startIcon={<CloseIcon />}
            variant="outlined"
            onClick={() => setShowModalInfoAd(false)}
          >
            <span>CERRAR</span>
          </LoadingButton>
          <LoadingButton
            color="primary"
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            type="submit"
            disabled={
              formik.isSubmitting || !!mensajeExitoAlert || Loading
            }
          >
            <span>GUARDAR</span>
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrdenesDetalleInfoAdModal;
