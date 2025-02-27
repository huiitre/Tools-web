<template>
  <div id="saving-allocation">
    <div class="s__recap">

      <div class="s__r__allocationList">
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">ETF MSCI World (25%):&nbsp;</div>
          <div class="s__r__a__e__value">10,000 €</div>
        </div>
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">ETF Europe (15%):&nbsp;</div>
          <div class="s__r__a__e__value">6,000 €</div>
        </div>
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">Obligations d'État (25%):&nbsp;</div>
          <div class="s__r__a__e__value">10,000 €</div>
        </div>
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">Obligations Entreprises (15%):&nbsp;</div>
          <div class="s__r__a__e__value">6,000 €</div>
        </div>
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">Compte courant Fortuneo (10%):&nbsp;</div>
          <div class="s__r__a__e__value">4,000 €</div>
        </div>
        <div class="s__r__a__elem">
          <div class="s__r__a__e__libelle">Bitcoin &amp; Ethereum (10%):&nbsp;</div>
          <div class="s__r__a__e__value">4,000 €</div>
        </div>
      </div>

      <div class="s__r__infos">
        <div class="s__r__total s__r__elem">
          <div class="s__r__e__libelle">Total (%) : &nbsp;</div>
          <div class="s__r__e__value">85,45%</div>
        </div>
        <div class="s__r__restant s__r__elem">
          <div class="s__r__e__libelle">Restant : &nbsp;</div>
          <div class="s__r__e__value">245,45 € (25,45%)</div>
        </div>
      </div>

    </div>

    <div class="s__amount">

      <div class="s__a__amount-field">
        <input type="number" step="any" placeholder="Montant à allouer" class="s__a__a__field" />
        <span class="s__a__a__euro">€</span>
      </div>

      <div class="s__a__actions">
        <v-btn class="s__a__a__btn s__a__a__reset" icon>
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>

    </div>

    <div class="s__action"></div>
    <div class="s__allocationList"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';


</script>

<style scoped>
#saving-allocation {
  width: 400px;
  max-width: 100%; /* Si la fenêtre est plus petite, il prend toute la largeur */
  margin: 2rem auto;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  box-shadow: 0 4px 8px #00000033;

  .s__recap {
    padding: 1rem;
    background-color: #8b2dff59;
    border: 2px solid #8b2dffb1;
    margin-bottom: 1rem;

    .s__r__allocationList {
      margin-bottom: 1.2rem;

      .s__r__a__elem {
        display: flex;
        font-size: 0.9rem;
        justify-content: space-between;

        &:not(:last-child) {
          margin-bottom: 0.2rem;
        }

        .s__r__a__e__libelle {
          
        }
        .s__r__a__e__value {
          font-weight: bold;
        }
      }
    }

    .s__r__infos {

      .s__r__elem {
        display: flex;
        font-style: italic;
        font-size: 0.8rem;

        &:not(:last-child) {
          margin-bottom: 0.2rem;
        }

        & .s__r__e__libelle {
          
        }
        & .s__r__e__value {
          font-weight: bold;
        }
      }
      .s__r__total {

      }
      .s__r__restant {

      }
    }
  }


  .s__amount {
    display: flex;
    gap: 1rem;

    .s__a__amount-field {
      position: relative;

      .s__a__a__field {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        border: 2px solid #8b2dff59;
        border-radius: 10px;
        box-shadow: inset 0 1px 3px #0000001a;
        transition: border-color 0.3s, box-shadow 0.3s;
        position: relative;
        text-align: right;
        font-weight: bold;
        padding-right: 2.5rem;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        &:focus {
          border-color: #8b2dffb1;
          outline: none;
          box-shadow: 0 0 8px #8b2dffb1;
        }
      }
      .s__a__a__euro {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
        color: #7b7b7b;
        font-weight: bold;
      }
    }
    .s__a__actions {
      display: flex;
      align-items: center;
      gap: 1rem;

      .s__a__a__btn {
        height: 100%;
        border-radius: 8px;

        &.s__a__a__reset {
          background-color: #ff000050;
          border: 2px solid #f44336;
          color: #f44336;
        }
      }
    }
  }
}
</style>
